import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const ActionItemInfo = DefineType({
  title: "Action Item Info",
  description: "Action Item information that mirrors datastore.",
  name: "action_item_info",
  type: Schema.types.object,
  properties: {
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
  required: ["id", "meeting_id", "assigned_to", "action", "end_date"],
});
