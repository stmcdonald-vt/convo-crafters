import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryUserLockDatastore } from "../datastores/user_lock_datastore.ts";

export const CheckNextTopicLock = DefineFunction({
  callback_id: "check_next_topic_lock",
  title: "Check Next Topic Lock",
  description: "Check if supplied speaker has an active next topic lock.",
  source_file: "functions/check_next_topic_lock.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      speaker_id: {
        type: Schema.types.string,
        description: "List enum choices",
      },
    },
    required: ["speaker_id", "interactivity"],
  },
  output_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      result: {
        type: Schema.types.boolean,
      },
    },
    required: ["result"],
  },
});

export default SlackFunction(
  CheckNextTopicLock,
  async ({ inputs, client }) => {
    const { speaker_id, interactivity } = inputs;

    const nowTimestampSeconds = Math.floor(Date.now() / 1000);

    // get locks that have not expired for a specific user
    const expressions = {
      expression: "#user_id = :user_id AND #expires_at > :nowTimestampSeconds", // Logic to query for specific channel and future reminders
      expression_attributes: {
        "#user_id": "user_id",
        "#expires_at": "expires_at",
      }, // Map query to channel and timestamp field on Reminder record
      expression_values: {
        ":user_id": speaker_id,
        ":nowTimestampSeconds": nowTimestampSeconds,
      },
    };

    const response = await queryUserLockDatastore(client, expressions);

    if (!response.ok) {
      return {
        total: 0,
        error: `Failed to fetch user locks: ${response.error}`,
      };
    }

    const result = !!response.items.length;

    return { outputs: { interactivity, result } };
  },
);
