import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SendRequestToSpeakerFunction } from "../functions/request_next_topic_definition.ts";

/**
 * A Workflow composed of two steps: asking for details from the user,
 * and then forward the details along with two buttons (approve and deny) to the selected speaker.
 */
export const Request_next_topic = DefineWorkflow({
  callback_id: "next_topic",
  title: "Request to Move on to Next Topic",
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
const formData = Request_next_topic.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Request Next Topic Details",
    interactivity: Request_next_topic.inputs.interactivity,
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

// Step 2: send next topic request details along with approve/deny buttons to speaker
Request_next_topic.addStep(SendRequestToSpeakerFunction, {
  interactivity: formData.outputs.interactivity,
  listener: Request_next_topic.inputs.interactivity.interactor.id,
  speaker: formData.outputs.fields.speaker,
  reason: formData.outputs.fields.reason,
});

export default Request_next_topic;
