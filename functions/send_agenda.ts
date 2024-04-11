import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { AgendaItemInfo } from "../types/agenda_item_info.ts";

export const SendAgendaFunction = DefineFunction({
  callback_id: "send_agenda",
  title: "Send Agenda in a message",
  description: "Send a message with the specified agenda items.",
  source_file: "functions/send_agenda.ts",
  input_parameters: {
    properties: {
      agenda_items: {
        type: Schema.types.array,
        items: {
          type: AgendaItemInfo,
        },
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      thread_ts: {
        type: Schema.slack.types.message_ts,
        description: "optionally used to send message as a response",
      },
    },
    required: ["agenda_items", "channel"],
  },
});

export default SlackFunction(
  SendAgendaFunction,
  async ({ inputs, client }) => {
    const { agenda_items, channel, thread_ts } = inputs;

    const message = agenda_items.map((item) =>
      agendaItemToMarkdownBullet(item.name, item.details)
    ).join("\n");

    if (channel && message) {
      await client.chat.postMessage({
        channel,
        text: message,
        thread_ts,
      });
    }

    return { outputs: {} };
  },
);

function agendaItemToMarkdownBullet(name: string, details?: string) {
  let item = `- ${name}`;
  if (details) {
    item += `\n  - ${details}`;
  }
  return item;
}
