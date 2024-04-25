import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { MeetingInfo } from "../types/meeting_info.ts";

export const RequestActionItems = DefineFunction({
  callback_id: "request_action_items",
  title: "Request action suggestions",
  description:
    "Send a message to a meeting's channel with a trigger link to add an action item.",
  source_file: "functions/request_action_items.ts",
  input_parameters: {
    properties: {
      meeting: {
        type: MeetingInfo,
      },
      thread_ts: {
        type: Schema.slack.types.message_ts,
        description: "optionally used to send message as a response",
      },
    },
    required: ["meeting"],
  },
});

export default SlackFunction(
  RequestActionItems,
  async ({ inputs, client }) => {
    const { meeting, thread_ts } = inputs;

    const { channel, action_trigger } = meeting;

    console.log(meeting);

    if (channel && action_trigger) {
      await client.chat.postMessage({
        channel,
        text: action_trigger,
        thread_ts,
      });
    }

    return { outputs: {} };
  },
);
