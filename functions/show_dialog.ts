import { SlackAPIClient } from "deno-slack-sdk/deps.ts";
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export enum DialogType {
  Error = "error",
  Success = "success",
}

export async function showDialog(
  client: SlackAPIClient,
  message: string,
  dialogType: DialogType,
  interactivityPointer: string,
) {
  const titleMapping = {
    error: "Something Went Wrong!",
    success: "Success!",
  };
  // Open a new modal with the end-user who interacted with the link trigger
  await client.views.open({
    interactivity_pointer: interactivityPointer,
    view: {
      type: "modal",
      title: { type: "plain_text", text: titleMapping[dialogType] },
      close: { type: "plain_text", text: "Close" },
      blocks: [
        {
          type: "section",
          text: { "type": "mrkdwn", "text": message },
        },
      ],
    },
  });
}

export const ShowDialogFunction = DefineFunction({
  callback_id: "show_dialog",
  title: "Show a dialog to the user",
  description: "Shows a dialog to the user.",
  source_file: "functions/show_dialog.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      dialogType: {
        type: Schema.types.string,
        enum: ["success", "error"],
        description: "Type of dialog to render",
      },
      message: {
        type: Schema.types.string,
        description: "Message to show in dialog.",
      },
    },
    required: ["interactivity", "dialogType", "message"],
  },
  /**
   * For some reason, having interactivity as an output parameter here
   * causes parameter_validation_failed. In most cases,
   * this is the last stop in the workflow, so we shouldn't
   * need to output interactivity. We can just output {} until it
   * is needed.
   */
  // output_parameters: {
  //   properties: {
  //     interactivity: {
  //       type: Schema.slack.types.interactivity,
  //     },
  //   },
  //   required: ["interactivity"],
  // },
});

export default SlackFunction(
  ShowDialogFunction,
  async ({ inputs, client }) => {
    const { interactivity, dialogType, message } = inputs;

    await dialogHelpers.showDialog(
      client,
      message,
      dialogType as DialogType,
      interactivity.interactivity_pointer,
    );

    return { outputs: {} };
  },
);

export const dialogHelpers = { showDialog };
