import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryMeetingDatastore } from "../datastores/meeting_datastore.ts";
import { MeetingEnumChoice } from "../types/meeting_info.ts";

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
      meetings: {
        type: Schema.types.array,
        items: { type: MeetingEnumChoice },
        title: "Meetings",
        description: "Meetings that are set for the future",
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

    const meetings = await queryMeetingDatastore(client, expressions);

    if (!meetings.ok) {
      return {
        total: 0,
        error: `Failed to fetch future meetings: ${meetings.error}`,
      };
    }

    // Transform DB records to simplified MeetingInfo
    const meetingInfo = meetings.items.map((meeting) => {
      return {
        value: meeting.id,
        // Temporary title, we should add a title to create meeting flow.
        title: `Meeting at ${meeting.timestamp} in ${meeting.channel}`,
      };
    });

    const meeting_ids = meetings.items.map((meeting) => meeting.id);

    return {
      outputs: {
        meeting_ids,
        meetings: meetingInfo,
        interactivity: inputs.interactivity,
      },
    };
  },
);
