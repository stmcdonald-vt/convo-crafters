import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { EnumChoice } from "../types/enum_choice.ts";
import { dialogHelpers, DialogType } from "./show_dialog.ts";

export const AbortOnEmptyEnumFunction = DefineFunction({
  callback_id: "abort_on_empty_enum",
  title: "Abort on empty enum",
  description: "Gracefully abort workflow if passed empty enum options.",
  source_file: "functions/abort_on_empty_enum.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      enum_choices: {
        type: Schema.types.array,
        items: { type: EnumChoice },
        description: "List enum choices",
      },
      error_message: {
        type: Schema.types.string,
        description: "Message to show if enum is empty.",
      },
    },
    required: ["enum_choices", "error_message", "interactivity"],
  },
  output_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: [],
  },
});

export default SlackFunction(
  AbortOnEmptyEnumFunction,
  async ({ inputs, client }) => {
    const { enum_choices, interactivity, error_message } = inputs;

    if (!enum_choices.length) {
      await dialogHelpers.showDialog(
        client,
        error_message,
        DialogType.Error,
        interactivity?.interactivity_pointer,
      );

      return { error: `No enum options were provided.` };
    } else {
      return { outputs: { interactivity } };
    }
  },
);
