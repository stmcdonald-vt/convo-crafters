import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryMeetingDatastore } from "../datastores/meeting_datastore.ts";
import { MeetingInfoType } from "../types/meeting_info.ts";

export const FetchFutureMeetingsFunction = DefineFunction({
  callback_id: "fetch_future_meetings_function",
  title: "Fetch Future Meetings",
  description: "Fetch meetings that have not yet occurred",
  source_file: "functions/fetch_future_meetings.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: {
    properties: {
      meetings: {
        type: Schema.types.array,
        items: { type: MeetingInfoType },
        title: "Meetings",
        description: "Meetings that are set for the future",
      },
    },
    required: ["meetings"],
  },
});

export default SlackFunction(
  FetchFutureMeetingsFunction,
  async ({ client }) => {
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
        id: meeting.id,
        channel: meeting.channel,
        timestamp: meeting.timestamp,
      };
    });

    return { outputs: { meetings: meetingInfo } };
  },
);
