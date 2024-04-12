import { DefineType, Schema } from "deno-slack-sdk/mod.ts";
import { ReminderInfo } from "./reminder_info.ts";

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
    remidners: {
      type: Schema.types.array,
      items: { type: ReminderInfo },
    },
  },
  required: ["id", "channel", "timestamp", "name", "reminders"],
});
