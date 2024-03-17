import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const MeetingInfoType = DefineType({
  title: "Meeting Info",
  description: "Represents a planned meeting location and time",
  name: "meeting",
  type: Schema.types.object,
  properties: {
    id: {
      type: Schema.types.string,
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    timestamp: {
      type: Schema.slack.types.timestamp,
    },
  },
  required: ["id", "channel", "timestamp"],
});
