import { when } from "mobx";
import Command from "./Command";
import CommandStatus from "./CommandStatus";
import { PiperStore } from "./PiperStore";

function generateTestingStore(...commands: string[]) {
  const store = new PiperStore();

  store.commands = [];

  for (const commandText of commands) {
    const newCommand = new Command(store);
    newCommand.commandText = commandText;
    store.commands.push(newCommand);
  }

  return store;
}

async function whenAllCommandsAreFinished(store: PiperStore) {
  return new Promise<void>((resolve) => {
    when(
      () => store.commands.every((cmd) => ![CommandStatus.RUNNING, CommandStatus.NEW].includes(cmd.status)),
      () => resolve()
    );
  });
}

async function runCommandsAndWaitForThemToFinish(...commands: string[]): Promise<PiperStore> {
  const store = generateTestingStore(...commands);

  store.runCommands();

  await whenAllCommandsAreFinished(store);

  return store;
}

test("simple scenario sanity", async () => {
  const store = await runCommandsAndWaitForThemToFinish("seq 100", "grep 5", "grep 3");
  expect(store.commands[store.commands.length - 1].stdout).toEqual("35\n53\n");
});

test("write after stream close shouldn't happen", async () => {
  const store = await runCommandsAndWaitForThemToFinish("seq 1000", "asd");

  expect(store.commands[0].process?.exitCode).toEqual(0);
  expect(store.commands[1].process?.exitCode).not.toEqual(0);
});

// eslint-disable-next-line jest/no-commented-out-tests
// test('cache triggering', () => {
//   const store = new PiperStore();
//   store.insertNewCommand(0);
//   store.insertNewCommand(0);
//   store.insertNewCommand(0);
//   store.insertNewCommand(0);
//   store.insertNewCommand(0);

//   store.setShouldCache(2, true);

//   expect(store.commands.map((cmd) => cmd._shouldCache)).toEqual([
//     true,
//     true,
//     true,
//     false,
//     false,
//   ]);

//   store.setShouldCache(1, false);

//   expect(store.commands.map((cmd) => cmd._shouldCache)).toEqual([
//     true,
//     false,
//     false,
//     false,
//     false,
//   ]);
// });
