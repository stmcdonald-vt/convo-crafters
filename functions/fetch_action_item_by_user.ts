import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryActionItemDatastore } from "../datastores/action_list_datastore.ts";
import { ActionItemInfo } from "../types/action_item_info.ts";

export const FetchUserActionItemsFunction = DefineFunction({
  callback_id: "fetch_user_action_items",
  title: "Fetch Action Items for User",
  description: "Fetch action items",
  source_file: "functions/fetch_action_item_by_user.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
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
      expression: "#user = :userID", // Logic to query for specific user
      expression_attributes: { "#user": "assigned_to" }, // Map query to assigned_to field on Action Item record
      expression_values: {
        ":userID": inputs.user,
      }, // Map query to requested user ID
    };

    const response = await queryActionItemDatastore(client, expressions);

    if (!response.ok) {
      return {
        total: 0,
        error: `Failed to fetch Meeting Action Items: ${response.error}`,
      };
    }

    // Transform into different usable outputs
    const action_items = response.items.map((item) => {
      return {
        id: item.id,
        meeting_id: item.meeting_id,
        name: item.name,
        details: item.details,
      };
    });

    return {
      outputs: {
        action_items,
        interactivity: inputs.interactivity,
      },
    };
  },
);
