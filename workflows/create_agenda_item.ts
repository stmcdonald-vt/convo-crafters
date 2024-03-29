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
          choices: futureMeetings.outputs.meetings,
        },
        {
          name: "name",
          title: "Provide the name of this agenda.",
          type: Schema.types.string,
        },
        {
          name: "details",
          title: "Provide details for this agenda.",
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
 * TODO: Make a custom function that takes in the selected meeting_id
 * and the fetched meetings and returns the channel_id.
 * With the channel_id, we can do the below ephemeral message.
 */
// CreateAgendaItem.addStep(Schema.slack.functions.SendEphemeralMessage, {
//   channel_id: SetupWorkflowForm.outputs.fields.channel,
//   user_id: CreateAgendaItem.inputs.interactivity.interactor.id,
//   message:
//     `Your meeting meeting for this channel was successfully created! :white_check_mark:`,
// });

export default CreateAgendaItem;
