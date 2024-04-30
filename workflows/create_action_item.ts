import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateActionItemSetupFunction } from "../functions/create_action_item.ts";
import { FetchPastMeetingsFunction } from "../functions/fetch_past_meetings.ts";
import { AbortOnEmptyEnumFunction } from "../functions/abort_on_empty_enum.ts";
import { GetUserTimezoneFunction } from "../functions/get_user_timezone.ts";

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

const timezoneCheck = CreateActionItem.addStep(
  GetUserTimezoneFunction,
  {
    user: CreateActionItem.inputs.interactivity.interactor.id,
    interactivity: CreateActionItem.inputs.interactivity,
  },
);

// Gather past meetings and pass through interactivity
const pastMeetings = CreateActionItem.addStep(
  FetchPastMeetingsFunction,
  {
    interactivity: timezoneCheck.outputs.interactivity,
    timezone: timezoneCheck.outputs.timezone,
  },
);

// Check if meetings exist or not
const enumCheck = CreateActionItem.addStep(
  AbortOnEmptyEnumFunction,
  {
    enum_choices: pastMeetings.outputs.meeting_enum_choices,
    interactivity: pastMeetings.outputs.interactivity,
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
      required: ["meeting", "assignment", "action", "date"],
      elements: [
        {
          name: "meeting",
          title: "Select a Meeting this Action Item is ",
          type: Schema.types.string,
          enum: pastMeetings.outputs.meeting_ids,
          choices: pastMeetings.outputs.meeting_enum_choices,
        },
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

CreateActionItem.addStep(CreateActionItemSetupFunction, {
  meeting_id: SetupWorkflowForm.outputs.fields.meeting,
  assigned_to: SetupWorkflowForm.outputs.fields.assignment,
  name: SetupWorkflowForm.outputs.fields.action,
  details: SetupWorkflowForm.outputs.fields.details,
  end_date: SetupWorkflowForm.outputs.fields.date,
  interactivity: SetupWorkflowForm.outputs.interactivity,
});

CreateActionItem.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: CreateActionItem.inputs.channel,
  user_id: CreateActionItem.inputs.interactivity.interactor.id,
  message: `Action item successfully assigned.`,
});

export default CreateActionItem;
