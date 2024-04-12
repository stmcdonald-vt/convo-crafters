import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import AbortOnEmptyEnumFunction from "../functions/abort_on_empty_enum.ts";
import { assertEquals } from "std/assert/assert_equals.ts";
import { dialogHelpers, DialogType } from "../functions/show_dialog.ts";
import {
  assertSpyCalls,
  stub,
} from "https://deno.land/std@0.221.0/testing/mock.ts";

const { createContext } = SlackFunctionTester("abort_on_empty_enum");

Deno.test("Empty enum choices", async () => {
  const showDialogStub = stub(dialogHelpers, "showDialog");

  const inputs = {
    interactivity: {
      interactivity_pointer: "ptr",
      interactor: { id: "uid", secret: "secret" },
    },
    enum_choices: [] as { value: string; title: string }[],
    error_message: "An error message!",
  };

  const { error, outputs } = await AbortOnEmptyEnumFunction(
    createContext({ inputs }),
  );

  // unwraps the showDialog method on the dialogHelpers object
  showDialogStub.restore();

  assertEquals(outputs, undefined);
  assertEquals(error, "No enum options were provided.");

  // showDialog only called once and with the correct args
  assertSpyCalls(showDialogStub, 1);
  assertEquals(showDialogStub.calls[0].args.slice(1), [
    "An error message!",
    DialogType.Error,
    inputs.interactivity.interactivity_pointer,
  ]);
});

Deno.test("not empty enum choices", async () => {
  const inputs = {
    interactivity: {
      interactivity_pointer: "ptr",
      interactor: { id: "uid", secret: "secret" },
    },
    enum_choices: [{ value: "value", title: "title" }],
    error_message: "An error message!",
  };

  const { error, outputs } = await AbortOnEmptyEnumFunction(
    createContext({ inputs }),
  );

  assertEquals(outputs, { interactivity: inputs.interactivity });
  assertEquals(error, undefined);
});
