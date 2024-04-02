import { RemindersDatastore } from "./../datastores/reminders.ts";
import CreateReminderFunction from "../functions/create_reminder.ts";
import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import {
  assertEquals,
  assertExists,
  assertMatch,
  assertStringIncludes,
} from "std/assert/mod.ts";

const { createContext } = SlackFunctionTester("create_reminder_setup_function");

// Replaces global fetch with the mocked copy
mf.install();

// Helps with Typescript inferring when testing the put payload
type ExpectedItemType = {
  id?: string;
  channel?: string;
  meeting?: string;
  date?: number;
  message?: string;
  author?: string;
};

Deno.test("Successfully create a reminder", async () => {
  let putDatastore;
  let putItem: ExpectedItemType = {};

  let message;

  mf.mock("POST@/api/apps.datastore.put", async (args) => {
    // Save the post payload to check
    const payload = await args.formData();
    putDatastore = payload.get("datastore");

    // FormData contains a string, convert to an object
    const itemString = payload.get("item")?.toString() || "{}";
    putItem = JSON.parse(itemString);
    return new Response(JSON.stringify({ ok: true }));
  });

  mf.mock("POST@/api/chat.scheduleMessage", async (args) => {
    const payload = await args.formData();
    message = payload.get("text");
    return new Response(JSON.stringify({ ok: true }));
  });

  const date = Date.now();

  const inputs = {
    channel: "channel-id",
    meeting: "meeting-id",
    date: date,
    message: "Test message",
    author: "author1",
  };

  const { error, outputs } = await CreateReminderFunction(
    createContext({ inputs }),
  );

  // No error indicates our mocked put route was called
  assertEquals(error, undefined);
  assertEquals(outputs, {});

  // Assert put payload
  assertEquals(putDatastore, RemindersDatastore.name);
  assertExists(putItem.id);
  assertMatch(putItem.id, RegExp(/.+/)); // At least one character
  assertEquals(putItem.channel, "channel-id");
  assertEquals(putItem.date, date);
  assertEquals(putItem.message, "Test message");
  assertEquals(putItem.author, "author1");
  assertEquals(message, "Test message");
});

Deno.test("Fail to create reminder", async () => {
  mf.mock("POST@/api/apps.datastore.put", () => {
    return new Response(
      JSON.stringify({ ok: false, error: "datastore_error" }),
    );
  });
  const date = Date.now();
  const inputs = {
    channel: "channel-id",
    meeting: "meeting-id",
    date: date,
    message: "Test message",
    author: "author1",
  };

  const { error, outputs } = await CreateReminderFunction(
    createContext({ inputs }),
  );

  assertExists(error);
  assertStringIncludes(error, "datastore_error");
  assertEquals(outputs, undefined);
});
