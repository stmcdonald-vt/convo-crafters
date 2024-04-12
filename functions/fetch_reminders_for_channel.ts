import { ReminderInfo } from "../types/reminder_info.ts";
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryMeetingDatastore } from "../datastores/meeting_datastore.ts";

export const FetchRemindersForChannelFunction = DefineFunction({
  callback_id: "fetch_reminders_for_channel_function",
  title: "Fetch Reminders for a Channel",
  description: "Fetch reminders for a specific channel",
  source_file: "functions/fetch_reminders_for_channel.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["channel"],
  },
  output_parameters: {
    properties: {
      reminders: {
        type: Schema.types.array,
        items: { type: ReminderInfo },
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: [
      "reminders",
    ],
  },
});

export default SlackFunction(
  FetchRemindersForChannelFunction,
  async ({ inputs, client }) => {
    const { channel } = inputs;
    const nowTimestampSeconds = Math.floor(Date.now() / 1000);

    // DynamoDB expression to represent "Timestamp in future"
    const expressions = {
      expression: "#timestamp > :nowTimestampSeconds", // Logic to query future meetings
      expression_attributes: { "#timestamp": "timestamp" }, // Map query to timestamp field on Meeting record
      expression_values: {
        ":nowTimestampSeconds": nowTimestampSeconds,
      }, // Map query to current time
    };

    const response = await queryMeetingDatastore(client, expressions);

    if (!response.ok) {
      return {
        total: 0,
        error: `Failed to fetch future meetings: ${response.error}`,
      };
    }

    const meeting = response.items.filter((meeting) =>
      meeting.channel === channel
    );

    const reminders = meeting.reminders;

    return {
      outputs: {
        reminders: reminders,
      },
    };
  },
);
