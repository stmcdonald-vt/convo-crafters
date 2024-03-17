import { PollDatastore } from "../datastores/poll_datastore.ts";

interface Poll {
  id: string;
  channel: string;
  question: string;
  options: { id: string; text: string }[];
}

export async function createPoll(
  channel: string,
  question: string,
  options: string[],
): Promise<string | null> {
  const poll: Poll = {
    id: Math.random().toString(36).substring(7),
    channel,
    question,
    options: options.map((option, index) => ({
      id: (index + 1).toString(),
      text: option,
    })),
  };

  try {
    await PollDatastore.create(poll);
    return poll.id;
  } catch (error) {
    console.error("Failed to create poll:", error);
    return null;
  }
}
