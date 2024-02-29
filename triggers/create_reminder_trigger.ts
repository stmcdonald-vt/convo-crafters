import { Trigger } from "deno-slack-api/types.ts";
import CreateReminderWorkflow from "../workflows/create_reminder.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the MessageSetupWorkflow workflow.
 */
const createReminderTrigger: Trigger<typeof CreateReminderWorkflow.definition> =
  {
    type: TriggerTypes.Shortcut,
    name: "Setup a Meeting Reminder",
    description: "Creates a meeting reminder for a given channel.",
    workflow: `#/workflows/${CreateReminderWorkflow.definition.callback_id}`,
    inputs: {
      interactivity: {
        value: TriggerContextData.Shortcut.interactivity,
      },
      channel: {
        value: TriggerContextData.Shortcut.channel_id,
      },
    },
  };

export default createReminderTrigger;
