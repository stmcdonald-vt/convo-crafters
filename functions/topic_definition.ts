import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Custom function that sends a message to the current speaker asking to move on to the next topic.
 * The message includes some Block Kit with two interactive
 * buttons: one to approve, and one to deny.
 */
export const SendRequestToSpeakerFunction = DefineFunction({
  callback_id: "request_next_topic",
  title: "Request to Move on to Next Topic",
  description: "Request to move on to the next topic",
  source_file: "functions/topic_mod.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      speaker: {
        type: Schema.slack.types.user_id,
        description: "The current speaker",
      },
      listener: {
        type: Schema.slack.types.user_id,
        description: "The user requesting to change topics",
      },
      reason: {
        type: Schema.types.string,
        description: "Your reason for wanting to move to the next topic",
      },
    },
    required: [
      "speaker",
      "listener",
      "reason",
      "interactivity",
    ],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});
