import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { ActionItemInfo } from "../types/action_item_info.ts";

export const SendActionFunction = DefineFunction({
  callback_id: "send_action",
  title: "Send Action Item in a message",
  description: "Send a message with the specified action items.",
  source_file: "functions/send_action_list.ts",
  input_parameters: {
    properties: {
      action_items: {
        type: Schema.types.array,
        items: {
          type: ActionItemInfo,
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
    required: ["action_items", "channel"],
  },
});

export default SlackFunction(
  SendActionFunction,
  async ({ inputs, client }) => {
    const { action_items, channel, thread_ts } = inputs;

    let message = "";
    if (action_items.length) {
      message += "*User Action List:*\n";
      message += action_items.map((item) =>
        actionItemToMarkdownBullet(item.name, item.end_date)
      ).join("\n");
    } else {
      message += "This user does not have any action items.";
    }

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

function actionItemToMarkdownBullet(action: string, end_date: number) {
  // let item = `• ${action}; due: ${end_date}`;
  return `• ${action} | due: ${end_date}`;
}
