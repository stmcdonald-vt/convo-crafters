import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
// import { CreateActionItemSetupFunction } from "../functions/create_action_item.ts";
import { DialogType, ShowDialogFunction } from "../functions/show_dialog.ts";
import { CreateReminderSetupFunction } from "../functions/create_reminder.ts";

export const CreateReminderForMeeting = DefineWorkflow({
  callback_id: "create_reminder_for_meeting",
  title: "Create reminder for meeting",
  description: "Create reminder for an existing meeting",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      meeting_id: {
        type: Schema.types.string,
      },
    },
    required: ["interactivity", "meeting_id"],
  },
});

const SetupWorkflowForm = CreateReminderForMeeting.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Reminder ",
    submit_label: "Submit",
    description: ":wave: Create a meeting reminder.",
    interactivity: CreateReminderForMeeting.inputs.interactivity,
    fields: {
      required: ["date", "message"],
      elements: [
        {
          name: "date",
          title: "Select a time to send the meeting reminder",
          type: Schema.slack.types.timestamp,
        },
        {
          name: "message",
          title: "Input a message for the reminder",
          type: Schema.types.string,
          long: true,
        },
      ],
    },
  },
);

/**
 * This step takes the form output and passes it along to a custom
 * function which saves the Action Item.
 */
const SaveReminderToDatastore = CreateReminderForMeeting.addStep(
  CreateReminderSetupFunction,
  {
    channel: CreateReminderForMeeting.inputs.channel,
    meeting_id: CreateReminderForMeeting.inputs.meeting_id,
    date: SetupWorkflowForm.outputs.fields.date,
    message: SetupWorkflowForm.outputs.fields.message,
    interactivity: SetupWorkflowForm.outputs.interactivity,
  },
);

/**
 * Open a confirmation dialog
 */
CreateReminderForMeeting.addStep(ShowDialogFunction, {
  interactivity: SaveReminderToDatastore.outputs.interactivity,
  dialogType: DialogType.Success,
  message: `Your reminder was successfully created! :white_check_mark:`,
});

export default CreateReminderForMeeting;
