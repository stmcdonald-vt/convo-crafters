import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateActionItemSetupFunction } from "../functions/create_action_item.ts";
import { FetchFutureMeetingsFunction } from "../functions/fetch_future_meetings.ts";
import { AbortOnEmptyEnumFunction } from "../functions/abort_on_empty_enum.ts";

export const CreateActionItem = DefineWorkflow({
  callback_id: "create_action_item",
  title: "Create action item",
  description: "Create action item",
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
const futureMeetings = CreateActionItem.addStep(
  FetchFutureMeetingsFunction,
  { interactivity: CreateActionItem.inputs.interactivity },
);

// Check if meetings exist or not
const enumCheck = CreateActionItem.addStep(
  AbortOnEmptyEnumFunction,
  {
    enum_choices: futureMeetings.outputs.meeting_enum_choices,
    interactivity: futureMeetings.outputs.interactivity,
    error_message:
      "No meetings were found. Please create a meeting before creating an action item.",
  },
);

const SetupWorkflowForm = CreateActionItem.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create Action Item",
    submit_label: "Submit",
    description: ":wave: Add an action item.",
    interactivity: enumCheck.outputs.interactivity,
    fields: {
      required: ["meeting", "assignment", "action", "end date"],
      elements: [
        {
          name: "meeting",
          title: "Select a Meeting this Action Item is ",
          type: Schema.types.string,
          enum: futureMeetings.outputs.meeting_ids,
          choices: futureMeetings.outputs.meeting_enum_choices,
        },
        {
          name: "assignment",
          title: "Provide who this action is assigned to",
          type: Schema.slack.types.user_id,
        },
        {
          name: "action",
          title: "Provide details of the action that is needed to be done",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "end date",
          title: "Provide the date that this action needs to be finished by",
          type: Schema.slack.types.timestamp,
        },
      ],
    },
  },
);

CreateActionItem.addStep(CreateActionItemSetupFunction, {
  assigned_to: SetupWorkflowForm.outputs.fields.assignment,
  action: SetupWorkflowForm.outputs.fields.action,
  end_date: SetupWorkflowForm.outputs.fields.timestamp,
});

CreateActionItem.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: CreateActionItem.inputs.channel,
  user_id: CreateActionItem.inputs.interactivity.interactor.id,
  message: `Action item successfully assigned.`,
});

export default CreateActionItem;