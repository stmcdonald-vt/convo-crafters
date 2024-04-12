import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { DatastoreQueryResponse } from "deno-slack-api/typed-method-types/apps.ts";
import { DatastoreItem, SlackAPIClient } from "deno-slack-api/types.ts";

const ACTION_ITEM_DATASTORE = "ActionItem";

export const ActionListDatastore = DefineDatastore({
  name: ACTION_ITEM_DATASTORE,
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    assigned_to: {
      type: Schema.slack.types.user_id,
    },
    action: {
      type: Schema.types.string,
    },
    status: {
      type: Schema.types.string,
    },
    start_date: {
      type: Schema.slack.types.date,
    },
    end_date: {
      type: Schema.slack.types.date,
    },
  },
});

export async function queryActionItemDatastore(
  client: SlackAPIClient,
  expressions?: object,
): Promise<{
  ok: boolean;
  items: DatastoreItem<typeof ActionListDatastore.definition>[];
  error?: string;
}> {
  const items: DatastoreItem<typeof ActionListDatastore.definition>[] = [];
  let cursor = undefined;

  // Page through the database and collect all meetings that match filter expressions
  do {
    const meetings: DatastoreQueryResponse<
      typeof ActionListDatastore.definition
    > = await client.apps.datastore.query<
      typeof ActionListDatastore.definition
    >({
      datastore: ACTION_ITEM_DATASTORE,
      cursor,
      ...expressions,
    });

    if (!meetings.ok) {
      return { ok: false, items, error: meetings.error };
    }

    cursor = meetings.response_metadata?.next_cursor;
    items.push(...meetings.items);
  } while (cursor);

  return { ok: true, items };
}
