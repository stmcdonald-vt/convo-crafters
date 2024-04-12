import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const EnumChoice = DefineType({
  title: "Enum Choice",
  description: "Type representing one choice for an enum-based input.",
  name: "enum_choice",
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
