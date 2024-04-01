import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
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
      name: {
        type: Schema.types.string,
        description: "Name for the meeting",
      },
    },
    required: ["channel", "timestamp"],
  },
});

export default SlackFunction(
  CreateMeetingSetupFunction,
  async ({ inputs, client }) => {
    const { channel, timestamp, name } = inputs;
    const uuid = crypto.randomUUID();

    // Save information about the welcome message to the datastore
    const putResponse = await client.apps.datastore.put<
      typeof MeetingDatastore.definition
    >({
      datastore: MeetingDatastore.name,
      item: { id: uuid, channel, timestamp, name },
    });

    if (!putResponse.ok) {
      return { error: `Failed to create meeting: ${putResponse.error}` };
    }

    return { outputs: {} };
  },
);
