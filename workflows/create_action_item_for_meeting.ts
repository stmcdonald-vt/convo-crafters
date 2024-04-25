import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateActionItemSetupFunction } from "../functions/create_action_item.ts";
import { DialogType, ShowDialogFunction } from "../functions/show_dialog.ts";

export const CreateActionItemForMeeting = DefineWorkflow({
  callback_id: "create_action_item_for_meeting",
  title: "Create action item for meeting",
  description: "Create action item for an existing meeting",
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

const SetupWorkflowForm = CreateActionItemForMeeting.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Action Item",
    submit_label: "Submit",
    description: ":wave: Add an action item.",
    interactivity: CreateActionItemForMeeting.inputs.interactivity,
    fields: {
      required: ["assignment", "action", "date"],
      elements: [
        {
          name: "assignment",
          title: "Provide who this action is assigned to",
          type: Schema.slack.types.user_id,
        },
        {
          name: "action",
          title: "Provide name of the action that is needed to be done",
          type: Schema.types.string,
        },
        {
          name: "details",
          title: "Provide details of the action that is needed to be done",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "date",
          title: "Provide the date that this action needs to be finished by",
          type: Schema.slack.types.timestamp,
        },
      ],
    },
  },
);

/**
 * This step takes the form output and passes it along to a custom
 * function which saves the Action Item.
 */
const SaveActionItemToDatastore = CreateActionItemForMeeting.addStep(
  CreateActionItemSetupFunction,
  {
    meeting_id: CreateActionItemForMeeting.inputs.meeting_id,
    assigned_to: SetupWorkflowForm.outputs.fields.assignment,
    action: SetupWorkflowForm.outputs.fields.action,
    details: SetupWorkflowForm.outputs.fields.details,
    end_date: SetupWorkflowForm.outputs.fields.date,
    interactivity: SetupWorkflowForm.outputs.interactivity,
  },
);

/**
 * Open a confirmation dialog
 */
CreateActionItemForMeeting.addStep(ShowDialogFunction, {
  interactivity: SaveActionItemToDatastore.outputs.interactivity,
  dialogType: DialogType.Success,
  message: `Your action item was successfully created! :white_check_mark:`,
});

export default CreateActionItemForMeeting;
