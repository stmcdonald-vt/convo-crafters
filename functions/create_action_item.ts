import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { ActionListDatastore } from "../datastores/action_list_datastore.ts";

export const CreateActionItemSetupFunction = DefineFunction({
  callback_id: "create_action_item_setup_function",
  title: "Create Action Item Setup",
  description: "Creates an action item and stores it in the datastore",
  source_file: "functions/create_action_item.ts",
  input_parameters: {
    properties: {
      assigned_to: {
        type: Schema.slack.types.user_id,
        description: "The person this action item is assigned to.",
      },
      action: {
        type: Schema.types.string,
        description: "The action required to be completed for this item.",
      },
      end_date: {
        type: Schema.slack.types.timestamp,
        description: "The date that this action should be completed by.",
      },
    },
    required: ["assigned_to", "action", "end_date"],
  },
});

export default SlackFunction(
  CreateActionItemSetupFunction,
  async ({ inputs, client }) => {
    const { assigned_to, action, end_date } = inputs;
    const uuid = crypto.randomUUID();

    const putResponse = await client.apps.datastore.put<
      typeof ActionListDatastore.definition
    >({
      datastore: ActionListDatastore.name,
      item: { id: uuid, assigned_to, action, end_date },
    });

    if (!putResponse.ok) {
      return { error: `Failed to create action item: ${putResponse.error}` };
    }

    return { outputs: {} };
  },
);
