import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { ActionListDatastore } from "../datastores/action_list_datastore.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";

export const CreateActionItemSetupFunction = DefineFunction({
  callback_id: "create_action_item_setup_function",
  title: "Create Action Item Setup",
  description: "Creates an action item and stores it in the datastore",
  source_file: "functions/create_action_item.ts",
  input_parameters: {
    properties: {
      meeting_id: {
        type: Schema.types.string,
        description: "Meeting to attach this action item to.",
      },
      assigned_to: {
        type: Schema.slack.types.user_id,
        description: "The person this action item is assigned to.",
      },
      action: {
        type: Schema.types.string,
        description: "The action required to be completed for this item.",
      },
      details: {
        type: Schema.types.string,
        description: "The details of the action.",
      },
      end_date: {
        type: Schema.slack.types.timestamp,
        description: "The date that this action should be completed by.",
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["assigned_to", "action", "details", "end_date"],
  },
  output_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: [],
  },
});

export default SlackFunction(
  CreateActionItemSetupFunction,
  async ({ inputs, client }) => {
    const {
      meeting_id,
      assigned_to,
      action,
      details,
      end_date,
      interactivity,
    } = inputs;
    const uuid = crypto.randomUUID();

    const putResponse = await client.apps.datastore.put<
      typeof ActionListDatastore.definition
    >({
      datastore: ActionListDatastore.name,
      item: { id: uuid, meeting_id, assigned_to, name, details, end_date },
    });

    if (!putResponse.ok) {
      return { error: `Failed to create action item: ${putResponse.error}` };
    }

    const setupResponse = await setupActionListReminder(
      client,
      assigned_to,
      end_date,
      "Reminder to Complete Task: " + action,
    );
    if (setupResponse.error) {
      return { error: `Failed to setup reminder: ${setupResponse.error}` };
    }

    return { outputs: { interactivity } };
  },
);

export async function setupActionListReminder(
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
