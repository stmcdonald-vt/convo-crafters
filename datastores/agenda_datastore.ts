import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

const AgendaDatastore = DefineDatastore({
  name: "Agenda",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    meeting_date: {
      type: Schema.slack.types.date,
    },
    topics: {
      items: {
        type: Schema.types.string,
      },
    },
    topics_status: {
      items: {
        type: Schema.types.string,
      },
    },
    isRecurring: {
      type: Schema.types.boolean
    },
  },
});

export default AgendaDatastore;