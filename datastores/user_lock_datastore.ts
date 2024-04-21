import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { DatastoreItem } from "deno-slack-api/types.ts";
import { DatastoreQueryResponse } from "deno-slack-api/typed-method-types/apps.ts";

export const USER_LOCK_DATASTORE = "UserLock";

export const UserLockDatastore = DefineDatastore({
  name: USER_LOCK_DATASTORE,
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    user_id: {
      type: Schema.slack.types.user_id,
    },
    expires_at: {
      type: Schema.slack.types.timestamp,
    },
  },
  // TTL for auto-cleanup. NOTE: Deletion is within a couple of days
  // so don't rely on delete happening right at ttl time.
  time_to_live_attribute: "expires_at",
});

/**
 * Returns the complete collection from the datastore for an expression
 *
 * @param client the client to interact with the Slack API
 * @param expressions optional DynamoDB filters and attributes to refine a query ()
 *
 * @returns ok if the query completed successfully
 * @returns items a list of responses from the datastore
 * @returns error the description of any server error
 */
export async function queryUserLockDatastore(
  client: SlackAPIClient,
  expressions?: object,
): Promise<{
  ok: boolean;
  items: DatastoreItem<typeof UserLockDatastore.definition>[];
  error?: string;
}> {
  const items: DatastoreItem<typeof UserLockDatastore.definition>[] = [];
  let cursor = undefined;

  // Page through the database and collect all userLocks that match filter expressions
  do {
    const userLocks: DatastoreQueryResponse<
      typeof UserLockDatastore.definition
    > = await client.apps.datastore.query<
      typeof UserLockDatastore.definition
    >({
      datastore: USER_LOCK_DATASTORE,
      cursor,
      ...expressions,
    });

    if (!userLocks.ok) {
      return { ok: false, items, error: userLocks.error };
    }

    cursor = userLocks.response_metadata?.next_cursor;
    items.push(...userLocks.items);
  } while (cursor);

  return { ok: true, items };
}
