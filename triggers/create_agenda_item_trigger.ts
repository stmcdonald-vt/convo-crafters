import { Trigger } from "deno-slack-api/types.ts";
import CreateAgendaItem from "../workflows/create_agenda_item.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the CreateAgendaItem workflow.
 */
const createAgendaItemTrigger: Trigger<typeof CreateAgendaItem.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Add agenda item",
  description: "Adds an agenda item to a meeting",
  workflow: `#/workflows/${CreateAgendaItem.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default createAgendaItemTrigger;
