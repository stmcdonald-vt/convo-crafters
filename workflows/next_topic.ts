import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SendRequestToSpeakerFunction } from "../functions/topic_definition.ts";
import { CheckNextTopicLock } from "../functions/check_next_topic_lock.ts";

/**
 * A Workflow composed of two steps: asking for details from the user,
 * and then forward the details along with two buttons (approve and deny) to the selected speaker.
 */
export const RequestNextTopic = DefineWorkflow({
  callback_id: "next_topic",
  title: "Next topic",
  description: "Request to move on to the next topic",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

// Step 1: opening a form for the user to input their request
const formData = RequestNextTopic.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Request Details",
    interactivity: RequestNextTopic.inputs.interactivity,
    submit_label: "Submit",
    description: "Enter your reason for wanting to move to the next topic",
    fields: {
      required: ["speaker", "reason"],
      elements: [
        {
          name: "speaker",
          title: "Speaker",
          type: Schema.slack.types.user_id,
        },
        {
          name: "reason",
          title: "Reason",
          type: Schema.types.string,
        },
      ],
    },
  },
);

// Step 2: check if speaker has an active lock preventing them from receiving another request.
const LockCheck = RequestNextTopic.addStep(CheckNextTopicLock, {
  interactivity: formData.outputs.interactivity,
  speaker_id: formData.outputs.fields.speaker,
});

// Step 3: send next topic request details along with approve/deny buttons to speaker
RequestNextTopic.addStep(SendRequestToSpeakerFunction, {
  interactivity: LockCheck.outputs.interactivity,
  listener: RequestNextTopic.inputs.interactivity.interactor.id,
  speaker: formData.outputs.fields.speaker,
  reason: formData.outputs.fields.reason,
  speaker_locked: LockCheck.outputs.result,
});

export default RequestNextTopic;
