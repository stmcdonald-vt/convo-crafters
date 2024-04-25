import { Trigger } from "deno-slack-api/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import ConfigureTriggers from "../workflows/configure_triggers.ts";

/**
 * This link trigger prompts the ConfigureTriggers workflow.
 */
const configureTriggersTrigger: Trigger<typeof ConfigureTriggers.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Add Convo Crafter to channels",
  description: "Adds Convo Crafter workflow triggers to a channel.",
  workflow: `#/workflows/${ConfigureTriggers.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
  },
};

export default configureTriggersTrigger;
