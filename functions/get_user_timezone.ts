import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GetUserTimezoneFunction = DefineFunction({
  callback_id: "get_user_timezone",
  title: "Get User Timezone",
  description: "Gets the user's timezone",
  source_file: "functions/get_user_timezone.ts",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
        description: "User Id to check timezone for",
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["user"],
  },
  output_parameters: {
    properties: {
      timezone: {
        type: Schema.types.string,
        description: "User's timezone",
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["timezone"],
  },
});

export default SlackFunction(
  GetUserTimezoneFunction,
  async ({ inputs, client }) => {
    const { user, interactivity } = inputs;

    const response = await client.users.info({ user, include_timezone: true });

    if (!response.ok) {
      return { error: `Unable to fetch user's information ${response.error}` };
    }

    const timezone = response.user.tz || "";

    return { outputs: { timezone, interactivity } };
  },
);
