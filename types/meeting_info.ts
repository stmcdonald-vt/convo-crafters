import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const MeetingInfo = DefineType({
  title: "Meeting Info",
  description: "Meeting information that mirrors datastore.",
  name: "meeting_info",
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
    name: {
      type: Schema.types.string,
    },
  },
  required: ["id", "channel", "timestamp", "name"],
});
