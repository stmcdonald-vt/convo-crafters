import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateReminderSetupFunction } from "../functions/create_reminder.ts";

export const CreateReminderWorkflow = DefineWorkflow({
  callback_id: "create_reminder",
  title: "Create reminder",
  description: "Create a reminder for a meeting",
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

const SetupWorkflowForm = CreateReminderWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Reminder Form",
    submit_label: "Submit",
    description: ":wave: Create a meeting reminder.",
    interactivity: CreateReminderWorkflow.inputs.interactivity,
    fields: {
      required: ["channel"],
      elements: [
        {
          name: "channel",
          title: "Select a channel to create the meeting reminder",
          type: Schema.slack.types.channel_id,
          default: CreateReminderWorkflow.inputs.channel,
        },
        {
          name: "date",
          title: "Select a time to send the meeting reminder",
          type: Schema.slack.types.timestamp,
          default: "now",
        },
        {
          name: "messageInput",
          title: "Input a message for the reminder.",
          type: Schema.types.string,
          long: true,
        },
      ],
    },
  },
);

/**
 * This step takes the form output and passes it along to a custom
 * function which sets the welcome message up.
 * See `/functions/setup_function.ts` for more information.
 */
CreateReminderWorkflow.addStep(CreateReminderSetupFunction, {
  channel: SetupWorkflowForm.outputs.fields.channel,
  date: SetupWorkflowForm.outputs.fields.date,
  message: SetupWorkflowForm.outputs.fields.messageInput,
  author: CreateReminderWorkflow.inputs.interactivity.interactor.id,
});

/**
 * This step uses the SendEphemeralMessage Slack function.
 * An ephemeral confirmation message will be sent to the user
 * creating the welcome message, after the user submits the above
 * form.
 */
// CreateReminderWorkflow.addStep(Schema.slack.functions.SendEphemeralMessage, {
//   channel_id: SetupWorkflowForm.outputs.fields.channel,
//   user_id: CreateReminderWorkflow.inputs.interactivity.interactor.id,
//   message:
//     `Your meeting reminder for this channel was successfully created! :white_check_mark:`,
// });

export default CreateReminderWorkflow;
