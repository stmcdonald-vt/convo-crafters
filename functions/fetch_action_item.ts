import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryActionItemDatastore } from "../datastores/action_list_datastore.ts";
import { ActionItemInfo } from "../types/action_item_info.ts";

export const FetchUserActionItemsFunction = DefineFunction({
  callback_id: "fetch_user_action_items",
  title: "Fetch Action Items for User",
  description: "Fetch action items",
  source_file: "functions/fetch_action_items.ts",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user"],
  },
  output_parameters: {
    properties: {
      action_items: {
        type: Schema.types.array,
        items: { type: ActionItemInfo },
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: [
      "action_items",
    ],
  },
});

export default SlackFunction(
  FetchUserActionItemsFunction,
  async ({ inputs, client }) => {
    const expressions = {
      expression: "#user = :userId", // Logic to query for specific meeting
      expression_attributes: { "#user": "assigned_to" }, // Map query to assigned_to field on action Item record
      expression_values: {
        ":userId": inputs.user,
      }, // Map query to requested user id
    };

    const response = await queryActionItemDatastore(client, expressions);

    if (!response.ok) {
      return {
        total: 0,
        error: `Failed to fetch User Action Items: ${response.error}`,
      };
    }

    // Transform into different usable outputs
    const action_items = response.items.map((item) => {
      return {
        id: item.id,
        meeting_id: item.meeting_id,
        assigned_to: item.assigned_to,
        action: item.action,
        status: item.status,
        end_date: item.end_date,
      };
    });

    return {
      outputs: {
        action_items,
      },
    };
  },
);
