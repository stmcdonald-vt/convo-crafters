import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

const requestNextTopicTrigger: Trigger = {
  type: TriggerTypes.Shortcut,
  name: "Request to Move on to Next Topic",
  description: "Ask the current speaker to move on to the next topic",
  workflow: "#/workflows/request_next_topic_workflow.ts",
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
  },
};

export default requestNextTopicTrigger;
