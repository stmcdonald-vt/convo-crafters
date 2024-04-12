import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const ReminderInfo = DefineType({
  title: "Reminder Info",
  description: "Meeting information that mirrors datastore.",
  name: "meeting_info",
  type: Schema.types.object,
  properties: {
    id: {
      type: Schema.types.string,
    },
    date: {
      type: Schema.slack.types.timestamp,
    },
    message: {
      type: Schema.types.string,
    },
    author: {
      type: Schema.slack.types.user_id,
    },
  },
  required: ["id", , "timestamp", "name"],
});
