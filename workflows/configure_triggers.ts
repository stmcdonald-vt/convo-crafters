import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { BookmarkTriggersFunction } from "../functions/bookmark_triggers.ts";
import { GetOrCreateAppTriggers } from "../functions/get_or_create_app_triggers.ts";

export const ConfigureTriggers = DefineWorkflow({
  callback_id: "configure_triggers",
  title: "Add Convo Crafter to channels",
  description: "Add the app triggers for Convo Crafter to channels",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

// This will be replaced with a multi-channel select input custom dialog. One channel at a time for now.
const SetupWorkflowForm = ConfigureTriggers.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Add Convo Crafter",
    submit_label: "Submit",
    description: "Add Convo Crafter to a channel",
    interactivity: ConfigureTriggers.inputs.interactivity,
    fields: {
      required: ["channel"],
      elements: [
        {
          name: "channel",
          title: "Channel to add Convo Crafter to",
          type: Schema.slack.types.channel_id,
        },
      ],
    },
  },
);

const appTriggers = ConfigureTriggers.addStep(GetOrCreateAppTriggers, {});

ConfigureTriggers.addStep(
  BookmarkTriggersFunction,
  {
    channel_ids: [SetupWorkflowForm.outputs.fields.channel],
    triggers: appTriggers.outputs.triggers,
  },
);

export default ConfigureTriggers;
