import { DefineWorkflow } from "deno-slack-sdk/mod.ts";

export const CreateReminder = DefineWorkflow({
  callback_id: "create_reminder",
  title: "Create reminder",
  description: "Create a reminder for a meeting",
  input_parameters: {
    properties: {
      interactivity: {
        type: "interactivity",
      },
      channel: {
        type: "channel_id",
      },
      user: {
        type: "user_id",
      },
    },
    required: ["user", "interactivity"],
  },
});
