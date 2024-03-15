import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

export const CreatePoll = DefineWorkflow({
  callback_id: "create_poll",
  title: "Create poll",
  description: "Create a poll",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});
