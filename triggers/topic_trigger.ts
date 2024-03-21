import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import RequestNextTopic from "../workflows/next_topic.ts";

const nextTopicTrigger: Trigger<typeof RequestNextTopic.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Request to Move on to Next Topic",
  description: "Ask the current speaker to move on to the next topic",
  workflow: `#/workflows/${RequestNextTopic.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
  },
};

export default nextTopicTrigger;
