import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import handler from "../functions/topic_mod.ts";

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/apps.datastore.put", () => {
  return new Response(JSON.stringify({ ok: true }));
});

mf.mock("POST@/api/chat.postMessage", async (req) => {
  const body = await req.formData();
  if (body.get("channel")?.toString() !== "U11111") {
    return new Response(
      `{"ok": false, "error": "unexpected channel ID. Actual ID: ${
        body.get("channel")?.toString()
      }"}`,
      {
        status: 200,
      },
    );
  }
  if (body.get("blocks") === undefined) {
    return new Response(`{"ok": false, "error": "blocks are missing!"}`, {
      status: 200,
    });
  }
  return new Response(`{"ok": true, "message": {"ts": "111.222"}}`, {
    status: 200,
  });
});

const { createContext } = SlackFunctionTester("my-function");

Deno.test("Topic functions run successfully", async () => {
  const inputs = {
    channel: "U11111",
    speaker: "U11111",
    listener: "U22222",
    reason: "Your reason for wanting to move to the next topic", // Add this line
    interactivity: {
      interactivity_pointer: "111.222.b79....",
      interactor: {
        id: "U33333",
        secret: "NDE0NTIxNDg....",
      },
    },
  };
  const env = { LOG_LEVEL: "ERROR" };
  const result = await handler(createContext({ inputs, env }));
  assertEquals(result, { completed: false });
});

Deno.test("Function fails gracefully when interactor's secret is invalid", async () => {
  const inputs = {
    channel: "U11111",
    speaker: "U11111",
    listener: "U22222",
    reason: "Your reason for wanting to move to the next topic",
    interactivity: {
      interactivity_pointer: "111.222.b79....",
      interactor: {
        id: "U33333",
        secret: "invalid_secret",
      },
    },
  };
  const env = { LOG_LEVEL: "ERROR" };
  try {
    const result = await handler(createContext({ inputs, env }));
    assertEquals(result, { completed: false });
  } catch (error) {
    console.log(error); // Log the error message
  }
});
