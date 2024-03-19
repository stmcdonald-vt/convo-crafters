import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { RemindersDatastore } from "../datastores/reminders.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { CreateReminder } from "../workflows/create_reminder.ts";

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
    required: ["channel", "date", "message", "author"],
  },
});

export default SlackFunction(
  CreateReminderSetupFunction,
  async ({ inputs, client }) => {
    const { channel, date, message, author } = inputs;
    const uuid = crypto.randomUUID();

    // Save information about the welcome message to the datastore
    const putResponse = await client.apps.datastore.put<
      typeof RemindersDatastore.definition
    >({
      datastore: RemindersDatastore.name,
      item: { id: uuid, channel, date, message, author },
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
    // Search for any existing triggers for the welcome workflow
    // const triggers = await findMeetingReminderTrigger(client, channel);
    // if (triggers.error) {
    //   return { error: `Failed to lookup existing triggers: ${triggers.error}` };
    // }

    return { outputs: {} };
  },
);

export function setupMeetingReminder(
  client: SlackAPIClient,
  channel: string,
  date: number,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = client.chat.scheduleMessage({
      channel: channel,
      text: message,
      post_at: date.toString(),
    });
    console.log(result);
    return Promise.resolve({ ok: true });
  } catch (error) {
    console.error(error);
    return Promise.resolve({ ok: false, error: error.message });
  }
}

export async function findMeetingReminderTrigger(
  client: SlackAPIClient,
  channel: string,
): Promise<{ error?: string; exists?: boolean }> {
  const allTriggers = await client.workflows.triggers.list({ is_owner: true });
  if (!allTriggers.ok) {
    return { error: allTriggers.error };
  }
  const joinedTriggers = allTriggers.triggers.filter((trigger) => (
    trigger.workflow.callback_id ===
      CreateReminder.definition.callback_id &&
    trigger.channel_ids.includes(channel)
  ));

  // Return if any matching triggers were found
  const exists = joinedTriggers.length > 0;
  return { exists };
}
