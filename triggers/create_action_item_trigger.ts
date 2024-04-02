import { Trigger } from "deno-slack-api/types.ts";
import CreateActionItem from "../workflows/create_action_item.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

const createActionItemTrigger: Trigger<typeof CreateActionItem.definition> = {
    type: TriggerTypes.Shortcut,
    name: "Add action item",
    description: "Adds an action item",
    workflow: `#/workflows/${CreateActionItem.definition.callback_id}`,
    inputs: {
        interactivity: {
            value: TriggerContextData.Shortcut.interactivity,
        },
        channel: {
            value: TriggerContextData.Shortcut.channel_id,
        },
    },
}

export default createActionItemTrigger;