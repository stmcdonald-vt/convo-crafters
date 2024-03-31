import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateAgendaItemSetupFunction } from "../functions/create_agenda_item.ts";
import { FetchFutureMeetingsFunction } from "../functions/fetch_future_meetings.ts";

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

// Gather future meetings and pass through interactivity
const futureMeetings = CreateAgendaItem.addStep(
  FetchFutureMeetingsFunction,
  { interactivity: CreateAgendaItem.inputs.interactivity },
);

const SetupWorkflowForm = CreateAgendaItem.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Agenda Item",
    submit_label: "Submit",
    description: ":wave: Add an agenda item.",
    interactivity: futureMeetings.outputs.interactivity,
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
CreateAgendaItem.addStep(CreateAgendaItemSetupFunction, {
  meeting_id: SetupWorkflowForm.outputs.fields.meeting,
  name: SetupWorkflowForm.outputs.fields.name,
  details: SetupWorkflowForm.outputs.fields.details,
});

/**
 * This step uses the SendEphemeralMessage Slack function.
 * TODO: It doesn't make sense to send a message in the same channel as the meeting
 * if the command is run from somewhere else. Might be worth having a generic confirmation
 * dialog and use that instead of message based confirmation?
 */
// CreateAgendaItem.addStep(Schema.slack.functions.SendEphemeralMessage, {
//   channel_id: CreateAgendaItem.inputs.channel,
//   user_id: CreateAgendaItem.inputs.interactivity.interactor.id,
//   message: `Your agenda item was successfully created! :white_check_mark:`,
// });

export default CreateAgendaItem;
