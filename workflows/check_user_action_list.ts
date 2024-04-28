import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { FetchUserActionItemsFunction } from "../functions/fetch_action_item_by_user.ts";
import { SendActionFunction } from "../functions/send_action_list.ts";

export const CheckUserAction = DefineWorkflow({
  callback_id: "check_user_action_list",
  title: "Display User Action List",
  description: "Display the action list of a user",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});

const SetupWorkflowForm = CheckUserAction.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start a meeting",
    submit_label: "Submit",
    interactivity: CheckUserAction.inputs.interactivity,
    fields: {
      required: ["user"],
      elements: [
        {
          name: "user",
          title: "Select a user",
          type: Schema.slack.types.user_id,
        },
      ],
    },
  },
);

const FetchedActionItems = CheckUserAction.addStep(
  FetchUserActionItemsFunction,
  {
    user: SetupWorkflowForm.outputs.fields.user,
  },
);

CheckUserAction.addStep(
  SendActionFunction,
  {
    action_items: FetchedActionItems.outputs.action_items,
    channel: CheckUserAction.outputs.channel_id,
  },
);

export default CheckUserAction;
