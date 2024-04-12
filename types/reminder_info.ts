import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const ReminderInfo = DefineType({
  title: "Reminder Info",
  description: "reminder information that mirrors datastore.",
  name: "reminder_info",
  type: Schema.types.object,
  properties: {
    id: {
      type: Schema.types.string,
    },
    channel: {
      type: Schema.slack.types.channel_id,
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
  required: ["id", "channel", "date", "name"],
});
