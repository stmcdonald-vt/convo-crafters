import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { MeetingDatastore } from "../datastores/meeting_datastore.ts";
import CreateAgendaItemForMeeting from "../workflows/create_agenda_item_for_meeting.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import { MeetingInfo } from "../types/meeting_info.ts";
import { SlackAPIClient } from "deno-slack-sdk/deps.ts";
import CreateActionItemForMeeting from "../workflows/create_action_item_for_meeting.ts";
import CreateReminderForMeeting from "../workflows/create_reminder_for_meeting.ts";

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

    // Create an agenda and action triggers and save to meeting
    // The triggers needs meeting id and meeting needs trigger urls, so do both here.
    const agendaTriggerResponse = await createAgendaTrigger(client, uuid, name);
    if (!agendaTriggerResponse.ok) {
      return {
        error:
          `Failed to create agenda trigger: ${agendaTriggerResponse.error}`,
      };
    }
    const agenda_trigger = agendaTriggerResponse.trigger?.shortcut_url;

    const actionTriggerResponse = await createActionTrigger(client, uuid, name);
    if (!actionTriggerResponse.ok) {
      return {
        error:
          `Failed to create action trigger: ${actionTriggerResponse.error}`,
      };
    }
    const action_trigger = actionTriggerResponse.trigger?.shortcut_url;

    const reminderTriggerResponse = await createMeetingReminder(
      client,
      uuid,
      name,
    );
    if (!reminderTriggerResponse.ok) {
      return {
        error:
          `Failed to create agenda trigger: ${reminderTriggerResponse.error}`,
      };
    }
    const reminder_trigger = reminderTriggerResponse.trigger?.shortcut_url;

    // Save information about the meeting to the datastore

    const item = {
      id: uuid,
      channel,
      timestamp,
      name,
      agenda_trigger,
      action_trigger,
      reminder_trigger,
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

async function createAgendaTrigger(
  client: SlackAPIClient,
  meeting_id: string,
  meeting_name: string,
) {
  const triggerResponse = await client.workflows.triggers.create<
    typeof CreateAgendaItemForMeeting.definition
  >({
    type: TriggerTypes.Shortcut,
    name: "Add agenda item to meeting",
    description: `Add an agenda item to the meeting: ${meeting_name}`,
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
        value: meeting_id,
      },
    },
  });
  return triggerResponse;
}

async function createActionTrigger(
  client: SlackAPIClient,
  meeting_id: string,
  meeting_name: string,
) {
  const triggerResponse = await client.workflows.triggers.create<
    typeof CreateActionItemForMeeting.definition
  >({
    type: TriggerTypes.Shortcut,
    name: "Add action item to meeting",
    description: `Add an action item to the meeting: ${meeting_name}`,
    workflow:
      `#/workflows/${CreateActionItemForMeeting.definition.callback_id}`,
    inputs: {
      interactivity: {
        value: TriggerContextData.Shortcut.interactivity,
      },
      channel: {
        value: TriggerContextData.Shortcut.channel_id,
      },
      meeting_id: {
        value: meeting_id,
      },
    },
  });
  return triggerResponse;
}

async function createMeetingReminder(
  client: SlackAPIClient,
  meeting_id: string,
  meeting_name: string,
) {
  const triggerResponse = await client.workflows.triggers.create<
    typeof CreateReminderForMeeting.definition
  >({
    type: TriggerTypes.Shortcut,
    name: "Add reminder to meeting",
    description: `Add a reminder to the meeting: ${meeting_name}`,
    workflow: `#/workflows/${CreateReminderForMeeting.definition.callback_id}`,
    inputs: {
      interactivity: {
        value: TriggerContextData.Shortcut.interactivity,
      },
      channel: {
        value: TriggerContextData.Shortcut.channel_id,
      },
      meeting_id: {
        value: meeting_id,
      },
    },
  });
  return triggerResponse;
}
