import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { RemindersDatastore } from "../datastores/reminders.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";

export const CreateReminderSetupFunction = DefineFunction({
  callback_id: "create_reminder_setup_function",
  title: "Create Reminder Setup",
  description: "Creates a meeting reminder and stores it in the datastore",
  source_file: "functions/create_reminder.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel to post in",
      },
      meeting_id: {
        type: Schema.types.string,
        description: "Meeting to attach this reminder to.",
      },
      date: {
        type: Schema.slack.types.timestamp,
        description: "Date to send the reminder",
      },
      message: {
        type: Schema.types.string,
        description: "The meeting reminder message",
      },
      author: {
        type: Schema.slack.types.user_id,
        description:
          "The user ID of the person who created the meeting reminder",
      },
    },
    required: ["channel", "meeting_id", "date", "message", "author"],
  },
});

export default SlackFunction(
  CreateReminderSetupFunction,
  async ({ inputs, client }) => {
    const { channel, meeting_id, date, message, author } = inputs;
    const uuid = crypto.randomUUID();

    // Save information about the welcome message to the datastore
    const putResponse = await client.apps.datastore.put<
      typeof RemindersDatastore.definition
    >({
      datastore: RemindersDatastore.name,
      item: { id: uuid, channel, meeting_id, date, message, author },
    });

    if (!putResponse.ok) {
      return { error: `Failed to create reminder: ${putResponse.error}` };
    }

    const setupResponse = await setupMeetingReminder(
      client,
      channel,
      date,
      message,
    );
    if (setupResponse.error) {
      return { error: `Failed to setup reminder: ${setupResponse.error}` };
    }

    return { outputs: {} };
  },
);

export async function setupMeetingReminder(
  client: SlackAPIClient,
  channel: string,
  date: number,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await client.chat.scheduleMessage({
      channel: channel,
      text: message,
      post_at: date,
    });
    console.log(result);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}
