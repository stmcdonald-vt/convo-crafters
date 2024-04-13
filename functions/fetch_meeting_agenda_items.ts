import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryAgendaItemDatastore } from "../datastores/agenda_item_datastore.ts";
import { AgendaItemInfo } from "../types/agenda_item_info.ts";

export const FetchMeetingAgendaItemsFunction = DefineFunction({
  callback_id: "fetch_meeting_agenda_items",
  title: "Fetch Meeting Agenda Items",
  description: "Fetch agenda items",
  source_file: "functions/fetch_meeting_agenda_items.ts",
  input_parameters: {
    properties: {
      meeting_id: {
        type: Schema.types.string,
      },
    },
    required: ["meeting_id"],
  },
  output_parameters: {
    properties: {
      agenda_items: {
        type: Schema.types.array,
        items: { type: AgendaItemInfo },
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: [
      "agenda_items",
    ],
  },
});

export default SlackFunction(
  FetchMeetingAgendaItemsFunction,
  async ({ inputs, client }) => {
    const expressions = {
      expression: "#meeting = :meetingId", // Logic to query for specific meeting
      expression_attributes: { "#meeting": "meeting_id" }, // Map query to meeting_id field on Agenda Item record
      expression_values: {
        ":meetingId": inputs.meeting_id,
      }, // Map query to requested meeting id
    };

    const response = await queryAgendaItemDatastore(client, expressions);

    if (!response.ok) {
      return {
        total: 0,
        error: `Failed to fetch Meeting Agenda Items: ${response.error}`,
      };
    }

    // Transform into different usable outputs
    const agenda_items = response.items.map((item) => {
      return {
        id: item.id,
        meeting_id: item.meeting_id,
        name: item.name,
        details: item.details,
      };
    });

    return {
      outputs: {
        agenda_items,
      },
    };
  },
);
