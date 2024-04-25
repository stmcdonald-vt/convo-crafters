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
    name: {
      type: Schema.types.string,
    },
    details: {
      type: Schema.types.string,
    },
  },
  required: ["id", "meeting_id", "name", "details"],
});
