import { Trigger } from "deno-slack-api/types.ts";
import CheckUserAction from "../workflows/check_user_action_list.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the display action workflow.
 */
const DisplayActionListTrigger: Trigger<typeof CheckUserAction.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Display User Action List",
  description: "Display Action Items Assigned to User",
  workflow: `#/workflows/${CheckUserAction.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default DisplayActionListTrigger;
