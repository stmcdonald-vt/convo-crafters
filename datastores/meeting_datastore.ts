import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { DatastoreItem } from "deno-slack-api/types.ts";
import { DatastoreQueryResponse } from "deno-slack-api/typed-method-types/apps.ts";

export const MEETING_DATASTORE = "Meeting";

export const MeetingDatastore = DefineDatastore({
  name: MEETING_DATASTORE,
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    timestamp: {
      type: Schema.slack.types.timestamp,
    },
    name: {
      type: Schema.types.string,
    },
    agenda_trigger: {
      type: Schema.types.string,
    },
    action_trigger: {
      type: Schema.types.string,
    },
    reminder_trigger: {
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
export async function queryMeetingDatastore(
  client: SlackAPIClient,
  expressions?: object,
): Promise<{
  ok: boolean;
  items: DatastoreItem<typeof MeetingDatastore.definition>[];
  error?: string;
}> {
  const items: DatastoreItem<typeof MeetingDatastore.definition>[] = [];
  let cursor = undefined;

  // Page through the database and collect all meetings that match filter expressions
  do {
    const meetings: DatastoreQueryResponse<typeof MeetingDatastore.definition> =
      await client.apps.datastore.query<typeof MeetingDatastore.definition>({
        datastore: MEETING_DATASTORE,
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
