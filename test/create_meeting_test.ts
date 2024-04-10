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

const { createContext } = SlackFunctionTester("create_meeting_setup_function");

// Replaces global fetch with the mocked copy
mf.install();

// Helps with Typescript inferring when testing the put payload
type ExpectedItemType = {
  id?: string;
  channel?: string;
  timestamp?: number;
  name?: string;
  agenda_trigger?: string;
};

// Successful trigger creation
mf.mock("POST@/api/workflows.triggers.create", () => {
  return new Response(
    JSON.stringify({ ok: true, trigger: { shortcut_url: "trigger" } }),
  );
});

Deno.test("Successfully save a meeting", async () => {
  let putDatastore;
  let putItem: ExpectedItemType = {};

  mf.mock("POST@/api/apps.datastore.put", async (args) => {
    // Save the post payload to check
    const payload = await args.formData();
    putDatastore = payload.get("datastore");

    // FormData contains a string, convert to an object
    const itemString = payload.get("item")?.toString() || "{}";
    putItem = JSON.parse(itemString);

    return new Response(JSON.stringify({ ok: true }));
  });

  const inputs = {
    channel: "channel-id",
    timestamp: 1710804,
    name: "meeting name",
  };

  const { error, outputs } = await CreateMeetingFunction(
    createContext({ inputs }),
  );

  // No error indicates our mocked put route was called
  assertEquals(error, undefined);
  assertEquals(outputs, { meeting: putItem });

  // Assert put payload
  assertEquals(putDatastore, MeetingDatastore.name);
  assertExists(putItem.id);
  assertMatch(putItem.id, RegExp(/.+/)); // At least one character
  assertEquals(putItem.channel, "channel-id");
  assertEquals(putItem.timestamp, 1710804);
  assertEquals(putItem.name, "meeting name");
  assertEquals(putItem.agenda_trigger, "trigger");
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
    name: "meeting name",
  };

  const { error, outputs } = await CreateMeetingFunction(
    createContext({ inputs }),
  );

  assertExists(error);
  assertStringIncludes(error, "datastore_error");
  assertEquals(outputs, undefined);
});

Deno.test("Fail to create a trigger", async () => {
  mf.mock("POST@/api/workflows.triggers.create", () => {
    return new Response(
      JSON.stringify({ ok: false, error: "a trigger error!" }),
    );
  });
  const inputs = {
    channel: "channel-id",
    timestamp: 1710804,
    name: "meeting name",
  };

  const { error, outputs } = await CreateMeetingFunction(
    createContext({ inputs }),
  );

  assertExists(error);
  assertStringIncludes(error, "a trigger error!");
  assertEquals(outputs, undefined);
});
