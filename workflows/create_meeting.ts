import { DefineWorkflow } from "deno-slack-sdk/mod.ts";

export const CreateMeeting = DefineWorkflow({
  callback_id: "create_meeting",
  title: "Create meeting",
  description: "Create a meeting",
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
