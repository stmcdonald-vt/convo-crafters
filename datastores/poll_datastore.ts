import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/automation/datastores
 */
export const PollDatastore = DefineDatastore({
  name: "poll",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    question: {
      type: Schema.types.string,
    },
    options: {
      type: Schema.types.array(Schema.types.object({
        id: Schema.types.string,
        text: Schema.types.string,
      })),
    },
    votes: {
      type: Schema.types.object({
        [Schema.types.string]: Schema.types.string, // Map of user_id to option_id
      }),
      default: {},
    },
  },
});
