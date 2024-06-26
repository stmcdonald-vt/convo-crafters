import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { MeetingInfo } from "../types/meeting_info.ts";

// This should be updated to MeetingInfoFromMeeting in the near future.
export const ChannelIdFromMeetingFunction = DefineFunction({
  callback_id: "channel_id_from_meeting",
  title: "Get Channel ID from Meeting",
  description:
    "Given a meeting.id and a list meetings, get the channel id of the meeting.",
  source_file: "functions/channel_id_from_meeting.ts",
  input_parameters: {
    properties: {
      meeting_id: {
        type: Schema.types.string,
        description: "Selected meeting Id.",
      },
      meetings: {
        type: Schema.types.array,
        items: {
          type: MeetingInfo,
        },
        description: "List of pre-fetched meetings",
      },
    },
    required: ["meeting_id", "meetings"],
  },
  output_parameters: {
    properties: {
      channel_id: {
        type: Schema.types.string,
      },
      meeting_name: {
        type: Schema.types.string,
      },
      meeting: {
        type: MeetingInfo,
      },
    },
    required: ["channel_id"],
  },
});

export default SlackFunction(
  ChannelIdFromMeetingFunction,
  ({ inputs }) => {
    const { meeting_id, meetings } = inputs;

    const selectedMeeting = meetings.find((meeting) =>
      meeting.id === meeting_id
    );

    if (!selectedMeeting) {
      return { error: "No meetings match the given id." };
    }

    return {
      outputs: {
        channel_id: selectedMeeting.channel,
        meeting_name: selectedMeeting.name,
        meeting: selectedMeeting,
      },
    };
  },
);
