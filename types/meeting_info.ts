import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const MeetingEnumChoice = DefineType({
  title: "Meeting Info",
  description: "Represents a planned meeting location and time",
  name: "meeting",
  type: Schema.types.object,
  properties: {
    value: {
      type: Schema.types.string,
    },
    title: {
      type: Schema.types.string,
    },
  },
  required: ["value", "title"],
});
