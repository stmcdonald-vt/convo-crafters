import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateReminderSetupFunction } from "../functions/create_reminder.ts";
import { UpdateReminderSetupFunction } from "../functions/update_reminder.ts";
import { FetchRemindersForChannelFunction } from "../functions/fetch_reminders_for_channel.ts";

export const UpdateReminder = DefineWorkflow({
  callback_id: "update_reminder",
  title: "Update reminder",
  description: "Update a reminder for a meeting",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity", "channel"],
  },
});

// Gather future meetings and pass through interactivity
const reminders = UpdateReminder.addStep(
  FetchRemindersForChannelFunction,
  {
    interactivity: UpdateReminder.inputs.interactivity,
    channel: UpdateReminder.inputs.channel,
  },
);

const SetupWorkflowForm = UpdateReminder.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Reminder Form",
    submit_label: "Submit",
    description: ":wave: Create a meeting reminder.",
    interactivity: UpdateReminder.inputs.interactivity,
    fields: {
      required: ["channel", "date"],
      elements: [
        {
          name: "reminder",
          title: "Select a reminder",
          type: Schema.types.string,
          enum: reminders.outputs.reminder_ids,
          choices: reminders.outputs.reminder_enum_choices,
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
UpdateReminder.addStep(UpdateReminderSetupFunction, {
  channel: SetupWorkflowForm.outputs.fields.channel,
  date: SetupWorkflowForm.outputs.fields.date,
  message: SetupWorkflowForm.outputs.fields.messageInput,
  author: UpdateReminder.inputs.interactivity.interactor.id,
});

/**
 * This step uses the SendEphemeralMessage Slack function.
 * An ephemeral confirmation message will be sent to the user
 * creating meeting reminder, after the user submits the above
 * form.
 */
UpdateReminder.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: SetupWorkflowForm.outputs.fields.channel,
  user_id: UpdateReminder.inputs.interactivity.interactor.id,
  message:
    `Your meeting reminder for this channel was successfully created! :white_check_mark:`,
});

export default UpdateReminder;
