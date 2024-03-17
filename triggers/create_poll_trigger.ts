import { DefineTrigger, Schema } from "deno-slack-sdk/mod.ts";
import CreatePoll from "../workflows/create_poll.ts";

export const CreatePollTrigger = DefineTrigger({
  callback_id: "create_poll_trigger",
  type: Schema.slack.types.interactivity,
  actions: [
    {
      name: "create_poll",
      type: Schema.slack.types.button,
      text: "Create Poll",
      style: "primary",
      value: "create_poll",
    },
  ],
});

CreatePollTrigger.onTrigger(async (trigger) => {
  await CreatePoll.run({
    interactivity: trigger,
    channel: trigger.channel.id,
  });
});

export default CreatePollTrigger;
