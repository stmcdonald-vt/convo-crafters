import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import {
  assertEquals,
  assertExists,
  assertStringIncludes,
} from "std/assert/mod.ts";
import { MeetingDatastore } from "../datastores/meeting_datastore.ts";
import { DatastoreItem } from "deno-slack-api/types.ts";
import FetchFutureMeetingsFunction from "../functions/fetch_future_meetings.ts";

const { createContext } = SlackFunctionTester("fetch_future_meetings");

// Mocked date for stable testing
const mockDate = new Date(1711000001000);
Date.now = () => mockDate.getTime();

// Collection of meetings stored in the mocked datastore
let mockMeetings: DatastoreItem<typeof MeetingDatastore.definition>[];

// Replaces global fetch with the mocked copy
mf.install();

// Mock the behavior of the datastore with an array filter
mf.mock("POST@/api/apps.datastore.query", async (args) => {
  const body = await args.formData();
  const timestamps = JSON.parse(body.get("expression_values") as string);

  // Ensures the correct timestamp is being used
  const futureMeetings = mockMeetings.filter((meeting) => (
    meeting.timestamp > timestamps[":nowTimestampSeconds"]
  ));
  return new Response(JSON.stringify({ ok: true, items: futureMeetings }));
});

// Helps with Typescript inferring when testing the put payload
type ExpectedItemType = {
  id?: string;
  channel?: string;
  timestamp?: number;
};

Deno.test("Fetches only future meetings", async () => {
  mockMeetings = [
    { id: "past-meeting-id", channel: "channel-id", timestamp: 1711000000 },
    {
      id: "right-now-meeting-id",
      channel: "channel-id",
      timestamp: 1711000001,
    },
    { id: "future-meeting-id-1", channel: "channel-id", timestamp: 1711000002 },
    { id: "future-meeting-id-2", channel: "channel-id", timestamp: 1711000003 },
  ];

  const { error, outputs } = await FetchFutureMeetingsFunction(
    createContext({ inputs: {} }),
  );

  // No error indicates our mocked query route was called
  assertEquals(error, undefined);
  assertEquals(
    outputs,
    { meetings: [mockMeetings[2], mockMeetings[3]] },
    "only future meeting returned",
  );
});

Deno.test("Fail to fetch", async () => {
  mf.mock("POST@/api/apps.datastore.query", () => {
    return new Response(
      JSON.stringify({ ok: false, error: "datastore_error" }),
    );
  });

  const { error, outputs } = await FetchFutureMeetingsFunction(
    createContext({ inputs: {} }),
  );

  assertExists(error);
  assertStringIncludes(error, "datastore_error");
  assertEquals(outputs, undefined);
});
