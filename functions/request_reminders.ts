import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { MeetingInfo } from "../types/meeting_info.ts";

export const RequestReminders = DefineFunction({
  callback_id: "request_reminders",
  title: "Request reminders",
  description:
    "Send a message to a meeting's channel with a trigger link to add a reminder.",
  source_file: "functions/request_reminders.ts",
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
  RequestReminders,
  async ({ inputs, client }) => {
    const { meeting, thread_ts } = inputs;

    const { channel, reminder_trigger } = meeting;

    if (channel && reminder_trigger) {
      await client.chat.postMessage({
        channel,
        text: reminder_trigger,
        thread_ts,
      });
    }

    return { outputs: {} };
  },
);
