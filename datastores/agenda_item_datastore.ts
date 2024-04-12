import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { DatastoreQueryResponse } from "deno-slack-api/typed-method-types/apps.ts";
import { DatastoreItem, SlackAPIClient } from "deno-slack-api/types.ts";

const AGENDA_ITEM_DATSTORE = "AgendaItem";

export const AgendaItemDatastore = DefineDatastore({
  name: AGENDA_ITEM_DATSTORE,
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    meeting_id: {
      type: Schema.types.string,
    },
    name: {
      type: Schema.types.string,
    },
    details: {
      type: Schema.types.string,
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
export async function queryAgendaItemDatastore(
  client: SlackAPIClient,
  expressions?: object,
): Promise<{
  ok: boolean;
  items: DatastoreItem<typeof AgendaItemDatastore.definition>[];
  error?: string;
}> {
  const items: DatastoreItem<typeof AgendaItemDatastore.definition>[] = [];
  let cursor = undefined;

  // Page through the database and collect all meetings that match filter expressions
  do {
    const meetings: DatastoreQueryResponse<
      typeof AgendaItemDatastore.definition
    > = await client.apps.datastore.query<
      typeof AgendaItemDatastore.definition
    >({
      datastore: AGENDA_ITEM_DATSTORE,
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
