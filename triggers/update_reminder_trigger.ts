import { Trigger } from "deno-slack-api/types.ts";
import UpdateReminder from "../workflows/update_reminder.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the CreateReminderWorkflow workflow.
 */
const updateReminderTrigger: Trigger<typeof UpdateReminder.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Update a Meeting Reminder",
  description: "Update a meeting reminder for a given channel.",
  workflow: `#/workflows/${UpdateReminder.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default updateReminderTrigger;
