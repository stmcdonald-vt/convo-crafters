import { Manifest } from "deno-slack-sdk/mod.ts";
import { load } from "std/dotenv/mod.ts";

// Datastores
import SampleObjectDatastore from "./datastores/sample_datastore.ts";
import { ActionListDatastore } from "./datastores/action_list_datastore.ts";
import { AgendaItemDatastore } from "./datastores/agenda_item_datastore.ts";
import { MeetingDatastore } from "./datastores/meeting_datastore.ts";
import { RemindersDatastore } from "./datastores/reminders.ts";
import { UserLockDatastore } from "./datastores/user_lock_datastore.ts";

// Workflows
import RequestNextTopic from "./workflows/next_topic.ts";
import { CreateReminder } from "./workflows/create_reminder.ts";
import { CreateMeeting } from "./workflows/create_meeting.ts";
import { CreateAgendaItem } from "./workflows/create_agenda_item.ts";
import { CreateActionItem } from "./workflows/create_action_item.ts";
import { CreatePoll } from "./workflows/create_poll.ts";
import { StartMeeting } from "./workflows/start_meeting.ts";
import ConfigureTriggers from "./workflows/configure_triggers.ts";
import { UpdateReminder } from "./workflows/update_reminder.ts";

// Types
import { EnumChoice } from "./types/enum_choice.ts";
import { MeetingInfo } from "./types/meeting_info.ts";
import CreateAgendaItemForMeeting from "./workflows/create_agenda_item_for_meeting.ts";
import { AgendaItemInfo } from "./types/agenda_item_info.ts";
import { ActionItemInfo } from "./types/action_item_info.ts";
import { Trigger } from "./types/trigger.ts";

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
    CreateAgendaItem,
    CreateActionItem,
    CreateMeeting,
    CreatePoll,
    CreateReminder,
    RequestNextTopic,
    CreateAgendaItemForMeeting,
    StartMeeting,
    ConfigureTriggers,
    UpdateReminder,
  ],

  // If your app communicates to any external domains, list them here.
  outgoingDomains: [],

  // A list of all Datastores the app will use
  datastores: [
    SampleObjectDatastore,
    ActionListDatastore,
    AgendaItemDatastore,
    RemindersDatastore,
    MeetingDatastore,
    UserLockDatastore,
  ],

  // A list of custom Types the app will use
  types: [
    EnumChoice,
    MeetingInfo,
    AgendaItemInfo,
    Trigger,
    ActionItemInfo,
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
    "bookmarks:write",
    "channels:join",
  ],
});
