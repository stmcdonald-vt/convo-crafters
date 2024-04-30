import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryMeetingDatastore } from "../datastores/meeting_datastore.ts";
import { EnumChoice } from "../types/enum_choice.ts";
import { MeetingInfo } from "../types/meeting_info.ts";

export const FetchPastMeetingsFunction = DefineFunction({
  callback_id: "fetch_past_meetings_function",
  title: "Fetch Past Meetings",
  description: "Fetch meetings that have already occurred",
  source_file: "functions/fetch_past_meetings.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      timezone: {
        type: Schema.types.string,
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
    required: [
      "meetings",
      "meeting_enum_choices",
      "meeting_ids",
    ],
  },
});

export default SlackFunction(
  FetchPastMeetingsFunction,
  async ({ inputs, client }) => {
    const nowTimestampSeconds = Math.floor(Date.now() / 1000);

    // DynamoDB expression to represent "Timestamp in past"
    const expressions = {
      expression: "#timestamp <= :nowTimestampSeconds", // Logic to query past meetings
      expression_attributes: { "#timestamp": "timestamp" }, // Map query to timestamp field on Meeting record
      expression_values: {
        ":nowTimestampSeconds": nowTimestampSeconds,
      }, // Map query to current time
    };

    const response = await queryMeetingDatastore(client, expressions);

    if (!response.ok) {
      return {
        total: 0,
        error: `Failed to fetch past meetings: ${response.error}`,
      };
    }

    const sortedMeetings = response.items.toSorted((a, b) =>
      a.timestamp - b.timestamp
    );

    // Transform into different usable outputs
    const meetings = sortedMeetings.map((meeting) => {
      return {
        id: meeting.id,
        name: meeting.name,
        channel: meeting.channel,
        timestamp: meeting.timestamp,
      };
    });

    const localeOptions = inputs.timezone
      ? { timeZone: inputs.timezone } as Intl.DateTimeFormatOptions
      : undefined;

    const meeting_enum_choices = sortedMeetings.map((meeting) => {
      return {
        value: meeting.id,
        title: `${meeting.name} at ${
          // Timestamp is in seconds and Date needs ms
          new Date(meeting.timestamp * 1000).toLocaleString(
            "en-US",
            localeOptions,
          )}`,
      };
    });

    const meeting_ids = sortedMeetings.map((meeting) => meeting.id);

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
