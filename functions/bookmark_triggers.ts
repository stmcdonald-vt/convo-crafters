import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { Trigger } from "../types/trigger.ts";

// const appTriggers = [
//   createMeetingTrigger
// ]

export const BookmarkTriggersFunction = DefineFunction({
  callback_id: "bookmark_triggers",
  title: "Bookmark Triggers",
  description: "Bookmark global triggers for this app.",
  source_file: "functions/bookmark_triggers.ts",
  input_parameters: {
    properties: {
      channel_ids: {
        type: Schema.types.array,
        items: { type: Schema.slack.types.channel_id },
        description: "Channel ids to set up in.",
      },
      triggers: {
        type: Schema.types.array,
        items: {
          type: Trigger,
        },
      },
    },
    required: ["channel_ids", "triggers"],
  },
});

export default SlackFunction(
  BookmarkTriggersFunction,
  async ({ inputs, client }) => {
    const { channel_ids, triggers } = inputs;

    for (const channel_id of channel_ids) {
      const joinChannelResponse = await client.conversations.join({
        channel: channel_id,
      });

      if (!joinChannelResponse.ok) {
        return {
          error: `Failed to join channel: ${joinChannelResponse.error}`,
        };
      }

      for (const trigger of triggers) {
        const bookmarkResponse = await client.bookmarks.add({
          channel_id,
          title: trigger.title,
          type: "link",
          link: trigger.url,
        });

        if (!bookmarkResponse.ok) {
          return {
            error: `Failed to bookmark trigger: ${bookmarkResponse.error}`,
          };
        }
      }
    }

    return { outputs: {} };
  },
);
