import { DefineWorkflow } from "deno-slack-sdk/mod.ts";

export const CreatePoll = DefineWorkflow({
  callback_id: "create_poll",
  title: "Create poll",
  description: "Create a poll",
  input_parameters: {
    properties: {
      interactivity: {
        type: "interactivity",
      },
      channel: {
        type: "channel_id",
      },
    },
    required: ["interactivity"],
  },
});
