import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SendReminderFunction } from "../functions/send_reminder.ts";

/**
 * The SendWelcomeMessageWorkFlow will retrieve the welcome message
 * from the datastore and send it to the specified channel, when
 * a new user joins the channel.
 */
export const SendReminder = DefineWorkflow({
  callback_id: "send_reminder_message",
  title: "Send Reminder Message",
  description: "Posts an ephemeral reminder message in the channel.",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      triggered_user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["channel", "triggered_user"],
  },
});

SendReminder.addStep(SendReminderFunction, {
  channel: SendReminder.inputs.channel,
  triggered_user: SendReminder.inputs.triggered_user,
});
