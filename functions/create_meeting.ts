import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { MeetingDatastore } from "../datastores/meeting_datastore.ts";

export const CreateMeetingSetupFunction = DefineFunction({
  callback_id: "create_meeting_setup_function",
  title: "Create Meeting Setup",
  description: "Creates a meeting and stores it in the datastore",
  source_file: "functions/create_meeting.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel to set up the meeting in",
      },
      timestamp: {
        type: Schema.slack.types.timestamp,
        description: "Date to send the meeting",
      },
    },
    required: ["channel", "timestamp"],
  },
});

export default SlackFunction(
  CreateMeetingSetupFunction,
  async ({ inputs, client }) => {
    const { channel, timestamp } = inputs;
    const uuid = crypto.randomUUID();

    // Save information about the welcome message to the datastore
    const putResponse = await client.apps.datastore.put<
      typeof MeetingDatastore.definition
    >({
      datastore: MeetingDatastore.name,
      item: { id: uuid, channel, timestamp },
    });

    if (!putResponse.ok) {
      return { error: `Failed to create meeting: ${putResponse.error}` };
    }

    // Search for any existing triggers for the welcome workflow
    const triggers = await findCreateMeetingTrigger(client, channel);
    if (triggers.error) {
      return { error: `Failed to lookup existing triggers: ${triggers.error}` };
    }

    return { outputs: {} };
  },
);

export async function findCreateMeetingTrigger(
  client: SlackAPIClient,
  channel: string,
): Promise<{ error?: string; exists?: boolean }> {
  const allTriggers = await client.workflows.triggers.list({ is_owner: true });
  if (!allTriggers.ok) {
    return { error: allTriggers.error };
  }
  const joinedTriggers = allTriggers.triggers.filter((trigger) => (
    trigger.workflow.callback_id ===
      CreateMeetingSetupFunction.definition.callback_id &&
    trigger.channel_ids.includes(channel)
  ));

  // Return if any matching triggers were found
  const exists = joinedTriggers.length > 0;
  return { exists };
}
