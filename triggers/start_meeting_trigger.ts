import { Trigger } from "deno-slack-api/types.ts";
import StartMeeting from "../workflows/start_meeting.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the CreateMeeting workflow.
 */
const startMeetingTrigger: Trigger<typeof StartMeeting.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Start a Meeting",
  description: "Start a meeting",
  workflow: `#/workflows/${StartMeeting.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default startMeetingTrigger;
