import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateMeetingSetupFunction } from "../functions/create_meeting.ts";
import { RequestAgendaSuggestions } from "../functions/request_agenda_suggestions.ts";
import { RequestReminders } from "../functions/request_reminders.ts";

export const CreateMeeting = DefineWorkflow({
  callback_id: "create_meeting",
  title: "Create meeting",
  description: "Create a meeting",
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

const SetupWorkflowForm = CreateMeeting.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Meeting Form",
    submit_label: "Submit",
    description: ":wave: Create a meeting.",
    interactivity: CreateMeeting.inputs.interactivity,
    fields: {
      required: ["channel", "date", "name"],
      elements: [
        {
          name: "channel",
          title: "Select a channel to create the meeting",
          type: Schema.slack.types.channel_id,
          default: CreateMeeting.inputs.channel,
        },
        {
          name: "name",
          title: "Give a name to the meeting",
          type: Schema.types.string,
        },
        {
          name: "date",
          title: "Select a time to schedule the meeting",
          type: Schema.slack.types.timestamp,
        },
      ],
    },
  },
);

/**
 * Send a
 */
const CreatedMeeting = CreateMeeting.addStep(CreateMeetingSetupFunction, {
  channel: SetupWorkflowForm.outputs.fields.channel,
  timestamp: SetupWorkflowForm.outputs.fields.date,
  name: SetupWorkflowForm.outputs.fields.name,
});

const SendConfirmationMessage = CreateMeeting.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: SetupWorkflowForm.outputs.fields.channel,
    message:
      `The meeting "${SetupWorkflowForm.outputs.fields.name}" was created! Please provide agenda item suggestions and reminders using the buttons in this thread.`,
  },
);

CreateMeeting.addStep(RequestAgendaSuggestions, {
  meeting: CreatedMeeting.outputs.meeting,
  thread_ts: SendConfirmationMessage.outputs.message_context.message_ts,
});

CreateMeeting.addStep(RequestReminders, {
  meeting: CreatedMeeting.outputs.meeting,
  thread_ts: SendConfirmationMessage.outputs.message_context.message_ts,
});

export default CreateMeeting;
