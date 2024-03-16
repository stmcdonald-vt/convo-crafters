import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { RemindersDatastore } from "../datastores/reminders.ts";

/**
 * This custom function will pull the stored message from the datastore
 * and send it to the joining user as an ephemeral message in the
 * specified channel.
 */
export const SendReminderFunction = DefineFunction({
  callback_id: "send_reminder_message_function",
  title: "Sending the Reminder Message",
  description: "Pull the reminder messages and sends it to the channel",
  source_file: "functions/send_reminder.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel where the event was triggered",
      },
      triggered_user: {
        type: Schema.slack.types.user_id,
        description: "User that triggered the event",
      },
    },
    required: ["channel", "triggered_user"],
  },
});

export default SlackFunction(SendReminderFunction, async (
  { inputs, client },
) => {
  // Querying datastore for stored messages
  const messages = await client.apps.datastore.query<
    typeof RemindersDatastore.definition
  >({
    datastore: RemindersDatastore.name,
    expression: "#channel = :mychannel",
    expression_attributes: { "#channel": "channel" },
    expression_values: { ":mychannel": inputs.channel },
  });

  if (!messages.ok) {
    return { error: `Failed to gather welcome messages: ${messages.error}` };
  }

  // Send the stored messages ephemerally
  for (const item of messages["items"]) {
    const message = await client.chat.postEphemeral({
      channel: item["channel"],
      text: item["message"],
      user: inputs.triggered_user,
    });

    if (!message.ok) {
      return { error: `Failed to send welcome message: ${message.error}` };
    }
  }

  return {
    outputs: {},
  };
});
