import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const MeetingDatastore = DefineDatastore({
  name: "Meeting",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    reminders: {
      type: Schema.types.array,
      items: {
        type: Schema.types.string,
      },
    },
    agendas: {
      type: Schema.types.array,
      items: {
        type: Schema.types.string,
      },
    },
    action_items: {
      type: Schema.types.array,
      items: {
        type: Schema.types.string,
      },
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    timestamp: {
      type: Schema.slack.types.timestamp,
    },
  },
});
