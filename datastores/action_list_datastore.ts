import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { DatastoreQueryResponse } from "deno-slack-api/typed-method-types/apps.ts";
import { DatastoreItem, SlackAPIClient } from "deno-slack-api/types.ts";

export const ActionListDatastore = DefineDatastore({
  name: "ActionList",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    meeting_id: {
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
    // start_date: {
    //   type: Schema.slack.types.timestamp,
    // },
    end_date: {
      type: Schema.slack.types.timestamp,
    },
  },
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
      datastore: "ActionList",
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
