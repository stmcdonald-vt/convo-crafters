import { Trigger } from "deno-slack-api/types.ts";
import CreateMeetingWorkflow from "../workflows/create_meeting.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the CreateMeetingWorkflow workflow.
 */
const createMeetingTrigger: Trigger<typeof CreateMeetingWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Setup a Meeting",
  description: "Creates a meeting for a given channel.",
  workflow: `#/workflows/${CreateMeetingWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default createMeetingTrigger;
