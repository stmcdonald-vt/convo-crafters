import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { FetchFutureMeetingsFunction } from "../functions/fetch_future_meetings.ts";
import { AbortOnEmptyEnumFunction } from "../functions/abort_on_empty_enum.ts";
import { ChannelIdFromMeetingFunction } from "../functions/channel_id_from_meeting.ts";
import { FetchMeetingAgendaItemsFunction } from "../functions/fetch_meeting_agenda_items.ts";
import { SendAgendaFunction } from "../functions/send_agenda.ts";

export const StartMeeting = DefineWorkflow({
  callback_id: "start_meeting",
  title: "Start a Meeting",
  description: "Start a meeting",
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

// Gather future meetings and pass through interactivity
const futureMeetings = StartMeeting.addStep(
  FetchFutureMeetingsFunction,
  { interactivity: StartMeeting.inputs.interactivity },
);

const enumCheck = StartMeeting.addStep(
  AbortOnEmptyEnumFunction,
  {
    enum_choices: futureMeetings.outputs.meeting_enum_choices,
    interactivity: futureMeetings.outputs.interactivity,
    error_message:
      "No meetings were found. Please create a meeting before starting one.",
  },
);

const SetupWorkflowForm = StartMeeting.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start a meeting",
    submit_label: "Submit",
    interactivity: enumCheck.outputs.interactivity,
    fields: {
      required: ["meeting"],
      elements: [
        {
          name: "meeting",
          title: "Select a meeting",
          type: Schema.types.string,
          enum: futureMeetings.outputs.meeting_ids,
          choices: futureMeetings.outputs.meeting_enum_choices,
        },
      ],
    },
  },
);

const ChannelFromMeeting = StartMeeting.addStep(
  ChannelIdFromMeetingFunction,
  {
    meeting_id: SetupWorkflowForm.outputs.fields.meeting,
    meetings: futureMeetings.outputs.meetings,
  },
);

const FetchedAgendaItems = StartMeeting.addStep(
  FetchMeetingAgendaItemsFunction,
  {
    meeting_id: SetupWorkflowForm.outputs.fields.meeting,
  },
);

const SendMeetingStartedMessage = StartMeeting.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: ChannelFromMeeting.outputs.channel_id,
    message:
      // Temporarily use meeting id here, need to expand channel_id_from_meeting to be meeting_info_from_meeting
      `The meeting: "${SetupWorkflowForm.outputs.fields.meeting}" is starting! You can view the meeting agenda in this thread.`,
  },
);

StartMeeting.addStep(
  SendAgendaFunction,
  {
    agenda_items: FetchedAgendaItems.outputs.agenda_items,
    channel: ChannelFromMeeting.outputs.channel_id,
    thread_ts: SendMeetingStartedMessage.outputs.message_context.message_ts,
  },
);

export default StartMeeting;
