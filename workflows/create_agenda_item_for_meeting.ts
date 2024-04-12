import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateAgendaItemSetupFunction } from "../functions/create_agenda_item.ts";
import { DialogType, ShowDialogFunction } from "../functions/show_dialog.ts";

export const CreateAgendaItemForMeeting = DefineWorkflow({
  callback_id: "create_agenda_item_for_meeting",
  title: "Create agenda item for meeting",
  description: "Create agenda item for an existing meeting",
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

const SetupWorkflowForm = CreateAgendaItemForMeeting.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Agenda Item",
    submit_label: "Submit",
    description: ":wave: Add an agenda item.",
    interactivity: CreateAgendaItemForMeeting.inputs.interactivity,
    fields: {
      required: ["name"],
      elements: [
        {
          name: "name",
          title: "Provide the name of this agenda item.",
          type: Schema.types.string,
        },
        {
          name: "details",
          title: "Provide details for this agenda item.",
          type: Schema.types.string,
          long: true,
        },
      ],
    },
  },
);

/**
 * This step takes the form output and passes it along to a custom
 * function which saves the Agenda Item.
 */
const SaveAgendaItemToDatastore = CreateAgendaItemForMeeting.addStep(
  CreateAgendaItemSetupFunction,
  {
    meeting_id: CreateAgendaItemForMeeting.inputs.meeting_id,
    name: SetupWorkflowForm.outputs.fields.name,
    details: SetupWorkflowForm.outputs.fields.details,
    interactivity: SetupWorkflowForm.outputs.interactivity,
  },
);

/**
 * Open a confirmation dialog
 */
CreateAgendaItemForMeeting.addStep(ShowDialogFunction, {
  interactivity: SaveAgendaItemToDatastore.outputs.interactivity,
  dialogType: DialogType.Success,
  message: `Your agenda item was successfully created! :white_check_mark:`,
});

export default CreateAgendaItemForMeeting;
