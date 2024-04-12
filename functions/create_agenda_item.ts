import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { AgendaItemDatastore } from "../datastores/agenda_item_datastore.ts";

export const CreateAgendaItemSetupFunction = DefineFunction({
  callback_id: "create_agenda_item_setup_function",
  title: "Create Agenda Item Setup",
  description: "Creates an agenda item and stores it in the datastore",
  source_file: "functions/create_agenda_item.ts",
  input_parameters: {
    properties: {
      meeting_id: {
        type: Schema.types.string,
        description: "Meeting to attach this agenda item to.",
      },
      name: {
        type: Schema.types.string,
        description: "The name of this agenda item.",
      },
      details: {
        type: Schema.types.string,
        description: "Longer description of this agenda.",
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["meeting_id", "name", "details", "interactivity"],
  },
  output_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

export default SlackFunction(
  CreateAgendaItemSetupFunction,
  async ({ inputs, client }) => {
    const { meeting_id, name, details, interactivity } = inputs;
    const uuid = crypto.randomUUID();

    const putResponse = await client.apps.datastore.put<
      typeof AgendaItemDatastore.definition
    >({
      datastore: AgendaItemDatastore.name,
      item: { id: uuid, meeting_id, name, details },
    });

    if (!putResponse.ok) {
      return { error: `Failed to create agenda item: ${putResponse.error}` };
    }

    return { outputs: { interactivity } };
  },
);
