import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import {
  assertEquals,
  assertExists,
  assertMatch,
  assertStringIncludes,
} from "std/assert/mod.ts";
import CreateMeetingFunction from "../functions/create_meeting.ts";
import { MeetingDatastore } from "../datastores/meeting_datastore.ts";
import { DatastoreItem } from "deno-slack-api/types.ts";

const { createContext } = SlackFunctionTester("fetch_future_meetings");

// Mocked date for stable testing
const mockDate = new Date();
mockDate.setSeconds(1711000000);
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

Deno.test("Successful fetch", async () => {
  let putDatastore;
  let putItem: ExpectedItemType = {};

  const inputs = {
    channel: "channel-id",
    timestamp: 1710804,
  };

  const { error, outputs } = await CreateMeetingFunction(
    createContext({ inputs }),
  );

  // No error indicates our mocked put route was called
  assertEquals(error, undefined);
  assertEquals(outputs, {});

  // Assert put payload
  assertEquals(putDatastore, MeetingDatastore.name);
  assertExists(putItem.id);
  assertMatch(putItem.id, RegExp(/.+/)); // At least one character
  assertEquals(putItem.channel, "channel-id");
  assertEquals(putItem.timestamp, 1710804);
});

Deno.test("Fail to save a meeting", async () => {
  mf.mock("POST@/api/apps.datastore.put", () => {
    return new Response(
      JSON.stringify({ ok: false, error: "datastore_error" }),
    );
  });

  const inputs = {
    channel: "channel-id",
    timestamp: 1710804,
  };

  const { error, outputs } = await CreateMeetingFunction(
    createContext({ inputs }),
  );

  assertExists(error);
  assertStringIncludes(error, "datastore_error");
  assertEquals(outputs, undefined);
});
