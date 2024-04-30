import { ReminderInfo } from "../types/reminder_info.ts";
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { queryRemindersDatastore } from "../datastores/reminders.ts";

export const FetchRemindersForChannelFunction = DefineFunction({
  callback_id: "fetch_reminders_for_channel_function",
  title: "Fetch Reminders for a Channel",
  description: "Fetch reminders for a specific channel",
  source_file: "functions/fetch_reminders_for_channel.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      timezone: {
        type: Schema.types.string,
      },
    },
    required: ["channel"],
  },
  output_parameters: {
    properties: {
      reminders: {
        type: Schema.types.array,
        items: { type: ReminderInfo },
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: [
      "reminders",
    ],
  },
});

export default SlackFunction(
  FetchRemindersForChannelFunction,
  async ({ inputs, client }) => {
    const { channel } = inputs;
    const nowTimestampSeconds = Math.floor(Date.now() / 1000);

    // get reminders for a specific channel and in the future
    const expressions = {
      expression: "#channel = :channel AND #timestamp > :nowTimestampSeconds", // Logic to query for specific channel and future reminders
      expression_attributes: {
        "#channel": "channel",
        "#timestamp": "timestamp",
      }, // Map query to channel and timestamp field on Reminder record
      expression_values: {
        ":channel": channel,
        ":nowTimestampSeconds": nowTimestampSeconds,
      },
    };

    const response = await queryRemindersDatastore(client, expressions);

    if (!response.ok) {
      return {
        total: 0,
        error: `Failed to fetch future meetings: ${response.error}`,
      };
    }

    const reminders = response.items.map((item) => {
      return {
        id: item.id,
        channel: item.channel,
        date: item.date,
        message: item.message,
      };
    });

    const localeOptions = inputs.timezone
      ? { timeZone: inputs.timezone } as Intl.DateTimeFormatOptions
      : undefined;

    const reminder_enum_choices = reminders.map((reminder) => {
      return {
        value: reminder.id,
        title: `${reminder.message} at ${
          // Timestamp is in seconds and Date needs ms
          new Date(reminder.date * 1000).toLocaleString(
            "en-US",
            localeOptions,
          )}`,
      };
    });

    const reminder_ids = reminders.map((reminder) => reminder.id);

    return {
      outputs: {
        reminders,
        reminder_enum_choices,
        reminder_ids,
      },
    };
  },
);
