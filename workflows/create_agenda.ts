import { DefineWorkflow } from "deno-slack-sdk/mod.ts";

export const CreateAgenda = DefineWorkflow({
  callback_id: "create_agenda",
  title: "Create agenda",
  description: "Create an agenda for a meeting",
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
