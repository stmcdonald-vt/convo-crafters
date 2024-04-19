import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryActionItemDatastore } from "../datastores/action_list_datastore.ts";
import { ActionItemInfo } from "../types/action_item_info.ts";

export const FetchActionItemsFunction = DefineFunction({
  callback_id: "fetch_action_items_function",
  title: "Fetch Meeting Action Items",
  description: "Fetch action items",
  source_file: "functions/fetch_action_items_by_meeting.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      meeting_id: {
        type: Schema.types.string,
      },
    },
    required: [],
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
  FetchActionItemsFunction,
  async ({ inputs, client }) => {
    const expressions = {
      expression: "#meeting = :meetingId", // Logic to query for specific meeting
      expression_attributes: { "#meeting": "meeting_id" }, // Map query to meeting_id field on Action Item record
      expression_values: {
        ":meetingId": inputs.meeting_id,
      }, // Map query to requested meeting id
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
