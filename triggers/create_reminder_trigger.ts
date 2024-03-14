import { Trigger } from "deno-slack-api/types.ts";
import CreateReminder from "../workflows/create_reminder.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the CreateReminderWorkflow workflow.
 */
const createReminderTrigger: Trigger<typeof CreateReminder.definition> =
    {
        type: TriggerTypes.Shortcut,
        name: "Setup a Meeting Reminder",
        description: "Creates a meeting reminder for a given channel.",
        workflow: `#/workflows/${CreateReminder.definition.callback_id}`,
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
