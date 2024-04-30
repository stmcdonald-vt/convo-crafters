/**
 * Based on user-inputted data, assemble a Block Kit approval message for easy
 * parsing by the approving speaker.
 */
// deno-lint-ignore no-explicit-any
export default function timeOffRequestHeaderBlocks(inputs: any): any[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `A listener has requested to move on to the next topic.`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Reason:* ${inputs.reason ? inputs.reason : "N/A"}`,
      },
    },
  ];
}
