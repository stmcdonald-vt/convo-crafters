import { Trigger } from "deno-slack-api/types.ts";
import CreateMeeting from "../workflows/create_meeting.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the CreateMeeting workflow.
 */
const createMeetingTrigger: Trigger<typeof CreateMeeting.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Setup a Meeting",
  description: "Creates a meeting for a given channel.",
  workflow: `#/workflows/${CreateMeeting.definition.callback_id}`,
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
