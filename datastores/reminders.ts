import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { DatastoreQueryResponse } from "deno-slack-api/typed-method-types/apps.ts";
import { DatastoreItem, SlackAPIClient } from "deno-slack-api/types.ts";

const REMINDERS_DATSTORE = "messages";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/automation/datastores
 */
export const RemindersDatastore = DefineDatastore({
  name: REMINDERS_DATSTORE,
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    date: {
      type: Schema.slack.types.timestamp,
    },
    message: {
      type: Schema.types.string,
    },
    author: {
      type: Schema.slack.types.user_id,
    },
  },
});

export async function queryRemindersDatastore(
  client: SlackAPIClient,
  expressions?: object,
): Promise<{
  ok: boolean;
  items: DatastoreItem<typeof RemindersDatastore.definition>[];
  error?: string;
}> {
  const items: DatastoreItem<typeof RemindersDatastore.definition>[] = [];
  let cursor = undefined;

  // Page through the database and collect all reminders that match filter expressions
  do {
    const reminders: DatastoreQueryResponse<
      typeof RemindersDatastore.definition
    > = await client.apps.datastore.query<
      typeof RemindersDatastore.definition
    >({
      datastore: REMINDERS_DATSTORE,
      cursor,
      ...expressions,
    });

    if (!reminders.ok) {
      return { ok: false, items, error: reminders.error };
    }

    cursor = reminders.response_metadata?.next_cursor;
    items.push(...reminders.items);
  } while (cursor);

  return { ok: true, items };
}
