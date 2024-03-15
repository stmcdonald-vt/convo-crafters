import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateReminderSetupFunction } from "../functions/create_reminder.ts";

export const CreateReminder = DefineWorkflow({
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

const SetupWorkflowForm = CreateReminder.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Reminder Form",
    submit_label: "Submit",
    description: ":wave: Create a meeting reminder.",
    interactivity: CreateReminder.inputs.interactivity,
    fields: {
      required: ["channel", "date"],
      elements: [
        {
          name: "channel",
          title: "Select a channel to create the meeting reminder",
          type: Schema.slack.types.channel_id,
          default: CreateReminder.inputs.channel,
        },
        {
          name: "date",
          title: "Select a time to send the meeting reminder",
          type: Schema.slack.types.timestamp,
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
CreateReminder.addStep(CreateReminderSetupFunction, {
  channel: SetupWorkflowForm.outputs.fields.channel,
  date: SetupWorkflowForm.outputs.fields.date,
  message: SetupWorkflowForm.outputs.fields.messageInput,
  author: CreateReminder.inputs.interactivity.interactor.id,
});

/**
 * This step uses the SendEphemeralMessage Slack function.
 * An ephemeral confirmation message will be sent to the user
 * creating meeting reminder, after the user submits the above
 * form.
 */
CreateReminder.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: SetupWorkflowForm.outputs.fields.channel,
  user_id: CreateReminder.inputs.interactivity.interactor.id,
  message:
    `Your meeting reminder for this channel was successfully created! :white_check_mark:`,
});

export default CreateReminder;
