import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { MeetingInfo } from "../types/meeting_info.ts";

export const RequestAgendaSuggestions = DefineFunction({
  callback_id: "request_agenda_suggestions",
  title: "Request agenda suggestions",
  description:
    "Send a message to a meeting's channel with a trigger link to add an agenda item.",
  source_file: "functions/request_agenda_suggestions.ts",
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
  RequestAgendaSuggestions,
  async ({ inputs, client }) => {
    const { meeting, thread_ts } = inputs;

    const { channel, agenda_trigger } = meeting;

    if (channel && agenda_trigger) {
      await client.chat.postMessage({
        channel,
        text: agenda_trigger,
        thread_ts,
      });
    }

    return { outputs: {} };
  },
);
