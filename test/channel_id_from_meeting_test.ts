import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "std/assert/assert_equals.ts";
import ChannelIdFromMeetingFunction from "../functions/channel_id_from_meeting.ts";

const { createContext } = SlackFunctionTester("channel_id_from_meeting");

const mockMeetings = [
  {
    id: "meeting-id-1",
    channel: "channel-id-1",
    timestamp: 1711000000,
    name: "meeting 1",
  },
  {
    id: "meeting-id-2",
    channel: "channel-id-2",
    timestamp: 1711000001,
    name: "meeting 2",
  },
  {
    id: "meeting-id-3",
    channel: "channel-id-3",
    timestamp: 1711000003,
    name: "meeting 3",
  },
];

Deno.test("Channel ID from meeting", async () => {
  const inputs = {
    meetings: mockMeetings,
    meeting_id: "meeting-id-2",
  };

  const { error, outputs } = await ChannelIdFromMeetingFunction(
    createContext({ inputs }),
  );

  assertEquals(outputs, {
    channel_id: "channel-id-2",
    meeting_name: "meeting 2",
  });
  assertEquals(error, undefined);
});

Deno.test("No meeting match in list", async () => {
  const inputs = {
    meetings: mockMeetings,
    meeting_id: "meeting-id-4",
  };

  const { error, outputs } = await ChannelIdFromMeetingFunction(
    createContext({ inputs }),
  );

  assertEquals(outputs, undefined);
  assertEquals(error, "No meetings match the given id.");
});
