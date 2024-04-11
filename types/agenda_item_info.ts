import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const AgendaItemInfo = DefineType({
  title: "Agenda Item Info",
  description: "Agenda Item information that mirrors datastore.",
  name: "agenda_item_info",
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
