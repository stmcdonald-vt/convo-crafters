import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import createMeetingTrigger from "../triggers/create_meeting_trigger.ts";
import createAgendaItemTrigger from "../triggers/create_agenda_item_trigger.ts";
import createReminderTrigger from "../triggers/create_reminder_trigger.ts";
import startMeetingTrigger from "../triggers/start_meeting_trigger.ts";
import nextTopicTrigger from "../triggers/topic_trigger.ts";

import { Trigger } from "../types/trigger.ts";
import createActionItemTrigger from "../triggers/create_action_item_trigger.ts";

const appTriggers = [
  createMeetingTrigger,
  createAgendaItemTrigger,
  createReminderTrigger,
  startMeetingTrigger,
  nextTopicTrigger,
  createActionItemTrigger,
];

export const GetOrCreateAppTriggers = DefineFunction({
  callback_id: "get_or_create_app_triggers",
  title: "Get or create app triggers",
  description: "Gets app triggers if they exist, creates any that are missing.",
  source_file: "functions/get_or_create_app_triggers.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: {
    properties: {
      triggers: {
        type: Schema.types.array,
        items: {
          type: Trigger,
        },
      },
    },
    required: ["triggers"],
  },
});

export default SlackFunction(
  GetOrCreateAppTriggers,
  async ({ client }) => {
    const allTriggers = await client.workflows.triggers.list({
      is_owner: true,
    });

    if (!allTriggers.ok) {
      return { error: `Failed to retrieve triggers: ${allTriggers.error}` };
    }

    const triggers: { title: string; url: string }[] = [];

    for (const appTrigger of appTriggers) {
      const foundTrigger = allTriggers.triggers.find((trigger) =>
        trigger.workflow.callback_id === appTrigger.workflow.split("/").at(-1)
      );

      if (foundTrigger) {
        // We found a matching trigger, return that
        triggers.push({
          title: foundTrigger.workflow.title,
          url: foundTrigger.shortcut_url,
        });
      } else {
        // Didn't find a matching trigger, create one.
        const response = await client.workflows.triggers.create(appTrigger);

        if (!response.ok) {
          return { error: `Failed to create trigger: ${response.error}` };
        }

        if (response.trigger.shortcut_url) {
          triggers.push({
            title: response.trigger.workflow.title,
            url: response.trigger?.shortcut_url,
          });
        }
      }
    }

    return { outputs: { triggers } };
  },
);
