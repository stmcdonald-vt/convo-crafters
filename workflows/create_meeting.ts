import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateMeetingSetupFunction } from "../functions/create_meeting.ts";

export const CreateMeetingWorkflow = DefineWorkflow({
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

const SetupWorkflowForm = CreateMeetingWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Meeting Form",
    submit_label: "Submit",
    description: ":wave: Create a meeting.",
    interactivity: CreateMeetingWorkflow.inputs.interactivity,
    fields: {
      required: ["channel", "date"],
      elements: [
        {
          name: "channel",
          title: "Select a channel to create the meeting",
          type: Schema.slack.types.channel_id,
          default: CreateMeetingWorkflow.inputs.channel,
        },
        {
          name: "date",
          title: "Select a time to send the meeting",
          type: Schema.slack.types.timestamp,
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
CreateMeetingWorkflow.addStep(CreateMeetingSetupFunction, {
  channel: SetupWorkflowForm.outputs.fields.channel,
  timestamp: SetupWorkflowForm.outputs.fields.date,
});

/**
 * This step uses the SendEphemeralMessage Slack function.
 * An ephemeral confirmation message will be sent to the user
 * creating meeting meeting, after the user submits the above
 * form.
 */
CreateMeetingWorkflow.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: SetupWorkflowForm.outputs.fields.channel,
  user_id: CreateMeetingWorkflow.inputs.interactivity.interactor.id,
  message:
    `Your meeting meeting for this channel was successfully created! :white_check_mark:`,
});

export default CreateMeetingWorkflow;
