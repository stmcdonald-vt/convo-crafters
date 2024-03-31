import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryMeetingDatastore } from "../datastores/meeting_datastore.ts";
import { EnumChoice } from "../types/enum_choice.ts";
import { MeetingInfo } from "../types/meeting_info.ts";

export const FetchFutureMeetingsFunction = DefineFunction({
  callback_id: "fetch_future_meetings_function",
  title: "Fetch Future Meetings",
  description: "Fetch meetings that have not yet occurred",
  source_file: "functions/fetch_future_meetings.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: [],
  },
  output_parameters: {
    properties: {
      meeting_ids: {
        type: Schema.types.array,
        items: { type: Schema.types.string },
      },
      meeting_enum_choices: {
        type: Schema.types.array,
        items: { type: EnumChoice },
      },
      meetings: {
        type: Schema.types.array,
        items: { type: MeetingInfo },
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["meetings"],
  },
});

export default SlackFunction(
  FetchFutureMeetingsFunction,
  async ({ inputs, client }) => {
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

    // Transform into different usable outputs
    const meetings = response.items.map((meeting) => {
      return {
        id: meeting.id,
        name: meeting.name,
        channel: meeting.channel,
        timestamp: meeting.timestamp,
      };
    });

    const meeting_enum_choices = response.items.map((meeting) => {
      return {
        value: meeting.id,
        title: meeting.name,
      };
    });

    const meeting_ids = response.items.map((meeting) => meeting.id);

    return {
      outputs: {
        meetings,
        meeting_enum_choices,
        meeting_ids,
        interactivity: inputs.interactivity,
      },
    };
  },
);
