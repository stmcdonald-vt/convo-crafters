import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

export const CreateAgenda = DefineWorkflow({
  callback_id: "create_agenda",
  title: "Create agenda",
  description: "Create an agenda for a meeting",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user", "interactivity"],
  },
});
