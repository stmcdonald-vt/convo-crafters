import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const AgendaItemDatastore = DefineDatastore({
  name: "AgendaItem",
  primary_key: "id",
  attributes: {
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
});
