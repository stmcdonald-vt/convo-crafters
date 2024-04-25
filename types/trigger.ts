import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const Trigger = DefineType({
  title: "Trigger",
  description: "Type representing the key data for a Workflow Trigger",
  name: "trigger",
  type: Schema.types.object,
  properties: {
    title: { type: Schema.types.string },
    url: { type: Schema.types.string },
  },
  required: ["title", "url"],
});
