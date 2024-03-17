import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { createPoll } from "../functions/create_poll.ts";

export const CreatePoll = DefineWorkflow({
  callback_id: "create_poll",
  title: "Create poll",
  description: "Create an anonymous poll",
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

const SetupPollForm = CreatePoll.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Poll Form",
    submit_label: "Submit",
    description: ":wave: Create an anonymous poll.",
    interactivity: CreatePoll.inputs.interactivity,
    fields: {
      required: ["channel", "question", "options"],
      elements: [
        {
          name: "channel",
          title: "Select a channel to create the poll",
          type: Schema.slack.types.channel_id,
          default: CreatePoll.inputs.channel,
        },
        {
          name: "question",
          title: "Enter the poll question",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "options",
          title: "Enter the poll options (comma separated)",
          type: Schema.types.string,
          long: true,
        },
      ],
    },
  },
);

CreatePoll.addStep(createPoll, {
  channel: SetupPollForm.outputs.fields.channel,
  question: SetupPollForm.outputs.fields.question,
  options: SetupPollForm.outputs.fields.options.split(","),
});

CreatePoll.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: SetupPollForm.outputs.fields.channel,
  user_id: CreatePoll.inputs.interactivity.interactor.id,
  message: `Your poll was successfully created! :white_check_mark:`,
});

export default CreatePoll;
