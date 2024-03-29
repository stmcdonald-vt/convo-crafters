import { Manifest } from "deno-slack-sdk/mod.ts";
import { load } from "std/dotenv/mod.ts";

// Datastores
import SampleObjectDatastore from "./datastores/sample_datastore.ts";
import ActionListDatastore from "./datastores/action_list_datastore.ts";
import AgendaDatastore from "./datastores/agenda_datastore.ts";
import { MeetingDatastore } from "./datastores/meeting_datastore.ts";
import { RemindersDatastore } from "./datastores/reminders.ts";

// Workflows
import RequestNextTopic from "./workflows/next_topic.ts";
import { CreateReminder } from "./workflows/create_reminder.ts";
import { CreateMeeting } from "./workflows/create_meeting.ts";
import { CreateAgenda } from "./workflows/create_agenda.ts";
import { CreatePoll } from "./workflows/create_poll.ts";

// Types
import { MeetingInfoType } from "./types/meeting_info.ts";

const env = await load();
/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  // This is the app's internal name.
  name: env.LOCAL_NAME || "Convo-Crafter",

  // App description the helps users decide whether to us it.
  description: "A Slack bot that facilitates meeting functions and flow",

  // The app's profile picture that will appear in the Slack client.
  icon: "assets/robot_logo.png",

  // A list of all workflows the app will use.
  workflows: [
    CreateAgenda,
    CreateMeeting,
    CreatePoll,
    CreateReminder,
    RequestNextTopic,
  ],

  // If your app communicates to any external domains, list them here.
  outgoingDomains: [],

  // A list of all Datastores the app will use
  datastores: [
    SampleObjectDatastore,
    ActionListDatastore,
    AgendaDatastore,
    RemindersDatastore,
    MeetingDatastore,
  ],

  // A list of custom Types the app will use
  types: [
    MeetingInfoType,
  ],

  /**
   * Defines the scope of Convo Crafter's permissions/abilities.
   * View the following for more info:
   * https://api.slack.com/scopes?filter=granular_bot
   */
  botScopes: [
    "calls:read", // View information about ongoing and past calls
    "calls:write", // Start and manage calls in a workspace
    "commands", // Add shortcuts and/or slash commands that people can use
    "channels:read", // View basic information about public channels in a workspace
    "chat:write", // Post messages in approved channels & conversations
    "chat:write.public", // Send messages to channels @your_slack_app isn't a member of
    "chat:write.customize", // Send messages as @your_slack_app
    "datastore:read",
    "datastore:write",
    "triggers:write", // Create new Platform triggers
    "triggers:read", // Read new Platform triggers
  ],
});
