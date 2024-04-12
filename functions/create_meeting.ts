import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { MeetingDatastore } from "../datastores/meeting_datastore.ts";
import CreateAgendaItemForMeeting from "../workflows/create_agenda_item_for_meeting.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import { MeetingInfo } from "../types/meeting_info.ts";

export const CreateMeetingSetupFunction = DefineFunction({
  callback_id: "create_meeting_setup_function",
  title: "Create Meeting Setup",
  description: "Creates a meeting and stores it in the datastore",
  source_file: "functions/create_meeting.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel to set up the meeting in",
      },
      timestamp: {
        type: Schema.slack.types.timestamp,
        description: "Date to send the meeting",
      },
      name: {
        type: Schema.types.string,
        description: "Name for the meeting",
      },
    },
    required: ["channel", "timestamp", "name"],
  },
  output_parameters: {
    properties: {
      meeting: {
        type: MeetingInfo,
        description: "The created meeting.",
      },
    },
    required: ["meeting"],
  },
});

export default SlackFunction(
  CreateMeetingSetupFunction,
  async ({ inputs, client }) => {
    const { channel, timestamp, name } = inputs;
    const uuid = crypto.randomUUID();

    // Create an agenda trigger and save to meeting
    // The trigger needs meeting id and meeting needs trigger url, so do both here.
    const triggerResponse = await client.workflows.triggers.create<
      typeof CreateAgendaItemForMeeting.definition
    >({
      type: TriggerTypes.Shortcut,
      name: "Add agenda item to meeting",
      description: `Add an agenda item to the meeting: ${name}`,
      workflow:
        `#/workflows/${CreateAgendaItemForMeeting.definition.callback_id}`,
      inputs: {
        interactivity: {
          value: TriggerContextData.Shortcut.interactivity,
        },
        channel: {
          value: TriggerContextData.Shortcut.channel_id,
        },
        meeting_id: {
          value: uuid,
        },
      },
    });

    if (!triggerResponse.ok) {
      return { error: `Failed to create trigger: ${triggerResponse.error}` };
    }

    const agenda_trigger = triggerResponse.trigger?.shortcut_url;

    // Save information about the meeting to the datastore

    const item = {
      id: uuid,
      channel,
      timestamp,
      name,
      agenda_trigger,
      reminders: [],
    };

    const putResponse = await client.apps.datastore.put<
      typeof MeetingDatastore.definition
    >({
      datastore: MeetingDatastore.name,
      item,
    });

    if (!putResponse.ok) {
      return { error: `Failed to create meeting: ${putResponse.error}` };
    }

    return { outputs: { meeting: item } };
  },
);
