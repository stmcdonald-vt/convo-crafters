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
        text: `A new request has been submitted`,
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
