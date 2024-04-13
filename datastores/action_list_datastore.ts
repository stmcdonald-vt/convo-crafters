import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const ActionListDatastore = DefineDatastore({
  name: "ActionList",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    meeting_id: {
      type: Schema.types.string,
    },
    assigned_to: {
      type: Schema.slack.types.user_id,
    },
    action: {
      type: Schema.types.string,
    },
    status: {
      type: Schema.types.string,
    },
    // start_date: {
    //   type: Schema.slack.types.timestamp,
    // },
    end_date: {
      type: Schema.slack.types.timestamp,
    },
  },
});
