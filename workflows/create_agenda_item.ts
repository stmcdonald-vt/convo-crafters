import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateAgendaItemSetupFunction } from "../functions/create_agenda_item.ts";
import { FetchFutureMeetingsFunction } from "../functions/fetch_future_meetings.ts";
import { AbortOnEmptyEnumFunction } from "../functions/abort_on_empty_enum.ts";
import { DialogType, ShowDialogFunction } from "../functions/show_dialog.ts";
import { GetUserTimezoneFunction } from "../functions/get_user_timezone.ts";

export const CreateAgendaItem = DefineWorkflow({
  callback_id: "create_agenda_item",
  title: "Create agenda item",
  description: "Create agenda item",
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

const timezoneCheck = CreateAgendaItem.addStep(
  GetUserTimezoneFunction,
  {
    user: CreateAgendaItem.inputs.interactivity.interactor.id,
    interactivity: CreateAgendaItem.inputs.interactivity,
  },
);

// Gather future meetings and pass through interactivity
const futureMeetings = CreateAgendaItem.addStep(
  FetchFutureMeetingsFunction,
  {
    interactivity: timezoneCheck.outputs.interactivity,
    timezone: timezoneCheck.outputs.timezone,
  },
);

const enumCheck = CreateAgendaItem.addStep(
  AbortOnEmptyEnumFunction,
  {
    enum_choices: futureMeetings.outputs.meeting_enum_choices,
    interactivity: futureMeetings.outputs.interactivity,
    error_message:
      "No meetings were found. Please create a meeting before creating an agenda item.",
  },
);

const SetupWorkflowForm = CreateAgendaItem.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Agenda Item",
    submit_label: "Submit",
    description: ":wave: Add an agenda item.",
    interactivity: enumCheck.outputs.interactivity,
    fields: {
      required: ["meeting", "name"],
      elements: [
        {
          name: "meeting",
          title: "Select a meeting",
          type: Schema.types.string,
          enum: futureMeetings.outputs.meeting_ids,
          choices: futureMeetings.outputs.meeting_enum_choices,
        },
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
const SaveAgendaItemToDatastore = CreateAgendaItem.addStep(
  CreateAgendaItemSetupFunction,
  {
    meeting_id: SetupWorkflowForm.outputs.fields.meeting,
    name: SetupWorkflowForm.outputs.fields.name,
    details: SetupWorkflowForm.outputs.fields.details,
    interactivity: SetupWorkflowForm.outputs.interactivity,
  },
);

/**
 * Open a confirmation dialog
 */
CreateAgendaItem.addStep(ShowDialogFunction, {
  interactivity: SaveAgendaItemToDatastore.outputs.interactivity,
  dialogType: DialogType.Success,
  message: `Your agenda item was successfully created! :white_check_mark:`,
});

export default CreateAgendaItem;
