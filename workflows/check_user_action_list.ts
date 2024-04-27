import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
// import { AbortOnEmptyEnumFunction } from "../functions/abort_on_empty_enum.ts";
// import { FetchFutureMeetingsFunction } from "../functions/fetch_future_meetings.ts";
import { FetchUserActionItemsFunction } from "../functions/fetch_action_item.ts";
import { SendActionFunction } from "../functions/send_action_list.ts";

export const CheckUser = DefineWorkflow({
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

// const futureMeetings = CheckUser.addStep(
//   FetchFutureMeetingsFunction,
//   { interactivity: CheckUser.inputs.interactivity },
// );
// const enumCheck = CheckUser.addStep(
//   AbortOnEmptyEnumFunction,
//   {
//     enum_choices: futureMeetings.outputs.meeting_enum_choices,
//     interactivity: futureMeetings.outputs.interactivity,
//     error_message:
//       "No meetings were found. Please create a meeting before starting one.",
//   },
// );

const SetupWorkflowForm = CheckUser.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start a meeting",
    submit_label: "Submit",
    interactivity: CheckUser.inputs.interactivity,
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

const FetchedActionItems = CheckUser.addStep(
  FetchUserActionItemsFunction,
  {
    user: SetupWorkflowForm.outputs.fields.user,
  },
);

// const SendMeetingStartedMessage = CheckUser.addStep(
//   Schema.slack.functions.SendMessage,
//   {
//     channel_id: CheckUser.outputs.channel_id,
//     message:
//       `Displaying Action list for "${SetupWorkflowForm.outputs.fields.user}"`,
//   },
// );

CheckUser.addStep(
  SendActionFunction,
  {
    action_items: FetchedActionItems.outputs.action_items,
    channel: CheckUser.outputs.channel_id,
    // thread_ts: SendMeetingStartedMessage.outputs.message_context.message_ts,
  },
);

export default CheckUser;
