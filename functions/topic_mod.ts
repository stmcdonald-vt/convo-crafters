import { SendRequestToSpeakerFunction } from "./topic_definition.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { APPROVE_ID, DENY_ID } from "../constants/topic_constants.ts";
import nextTopicRequestHeaderBlocks from "./topic_blocks.ts";
import { UserLockDatastore } from "../datastores/user_lock_datastore.ts";
import { DialogType, showDialog } from "./show_dialog.ts";

// Custom function that sends a message to the current speaker asking
// to move on to the next topic. The message includes some Block Kit with two
// interactive buttons: one to approve, and one to deny.
export default SlackFunction(
  SendRequestToSpeakerFunction,
  async ({ inputs, client }) => {
    // Rate limit requests
    if (inputs.speaker_locked) {
      await showDialog(
        client,
        "The speaker has already received a request to move to the next topic. Please wait before sending another request.",
        DialogType.RateLimit,
        inputs.interactivity?.interactivity_pointer,
      );
      return { outputs: {} };
    }

    console.log("Forwarding the request:", inputs);

    // Create a block of Block Kit elements composed of header blocks
    // plus the acknowledge button
    const blocks = nextTopicRequestHeaderBlocks(inputs).concat([{
      "type": "actions",
      "block_id": "approve-deny-buttons",
      "elements": [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Acknowledge",
          },
          action_id: APPROVE_ID,
          style: "primary",
        },
      ],
    }]);

    // Send the message to the manager
    const msgResponse = await client.chat.postMessage({
      channel: inputs.speaker,
      blocks,
      // Fallback text to use when rich media can't be displayed (i.e. notifications) as well as for screen readers
      text: "A listener has requested to move on to the next topic.",
    });

    if (!msgResponse.ok) {
      console.log("Error during request chat.postMessage!", msgResponse.error);
    }

    // Create a lock to prevent the speaker from getting bombarded by requests
    const nowTimestampSeconds = Math.floor(Date.now() / 1000);
    const lockDurationSeconds = 100;

    const item = {
      id: crypto.randomUUID(),
      user_id: inputs.speaker,
      expires_at: nowTimestampSeconds + lockDurationSeconds,
    };

    const putLockResponse = await client.apps.datastore.put<
      typeof UserLockDatastore.definition
    >({
      datastore: UserLockDatastore.name,
      item,
    });

    if (!putLockResponse.ok) {
      console.log("Error during lock creation!", putLockResponse.error);
    }
    return {
      completed: false,
    };
  },
  // Create an 'actions handler', which is a function that will be invoked
  // when specific interactive Block Kit elements (like buttons!) are interacted
  // with.
).addBlockActionsHandler(
  // listen for interactions with components with the following action_ids
  [APPROVE_ID, DENY_ID],
  // interactions with the above two action_ids get handled by the function below
  async function ({ action, body, client }) {
    console.log("Incoming action handler invocation", action);

    // Send speaker's response as a message to listener
    const msgResponse = await client.chat.postMessage({
      channel: body.function_data.inputs.listener,
      blocks: [{
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text:
              `Your request to move on to the next topic was acknowledged by <@${body.user.id}>`,
          },
        ],
      }],
      text: `Your request was acknowledged!`,
    });
    if (!msgResponse.ok) {
      console.log(
        "Error during requester update chat.postMessage!",
        msgResponse.error,
      );
    }

    // Update the speaker's message to remove the buttons and reflect the approval
    // state. Nice little touch to prevent further interactions with the buttons
    // after one of them were clicked.
    const msgUpdate = await client.chat.update({
      channel: body.container.channel_id,
      ts: body.container.message_ts,
      blocks: nextTopicRequestHeaderBlocks(body.function_data.inputs).concat([
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Acknowledged",
            },
          ],
        },
      ]),
    });
    if (!msgUpdate.ok) {
      console.log("Error during speaker chat.update!", msgUpdate.error);
    }

    // And now we can mark the function as 'completed' - which is required as
    // we explicitly marked it as incomplete in the main function handler.
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: {},
    });
  },
);
