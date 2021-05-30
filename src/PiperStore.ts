import { makeAutoObservable } from "mobx";
// eslint-disable-next-line import/no-cycle
import Command from "./Command";
import CommandStatus from "./CommandStatus";
import { yieldPairs } from "./utils";

export class PiperStore {
  // shellProgram: string;

  // #region workingDirectory

  private _workingDirectory?: string;

  public get workingDirectory(): string | undefined {
    return this._workingDirectory;
  }

  public set workingDirectory(v: string | undefined) {
    this._workingDirectory = v;
  }

  // #endregion

  // #region shellProgram

  private _shellProgram?: string;

  public get shellProgram(): string | undefined {
    return this._shellProgram;
  }

  public set shellProgram(v: string | undefined) {
    this._shellProgram = v;
  }

  // #endregion

  // #region killPredecessorOnClose

  private _killPredecessorOnClose?: boolean = false;

  public get killPredecessorOnClose(): boolean | undefined {
    return this._killPredecessorOnClose;
  }

  public set killPredecessorOnClose(v: boolean | undefined) {
    this._killPredecessorOnClose = v;
  }

  // #endregion

  // #region pathEnvVar

  private _pathEnvVar?: string;

  public get pathEnvVar(): string | undefined {
    return this._pathEnvVar;
  }

  public set pathEnvVar(v: string | undefined) {
    this._pathEnvVar = v;
  }

  // #endregion

  public commands: Command[] = [new Command(this)];

  // #region WhatToDisplay stuff

  private _whatToDisplay: { commandId: string; outputType: "stdout" | "stderr" } | undefined;

  public get whatToDisplay(): { commandId: string; outputType: "stdout" | "stderr" } | undefined {
    return this._whatToDisplay;
  }

  public set whatToDisplay(v: { commandId: string; outputType: "stdout" | "stderr" } | undefined) {
    this._whatToDisplay = v;
  }

  clearWhatToDisplay() {
    this.whatToDisplay = undefined;
  }

  // #endregion

  constructor() {
    makeAutoObservable(this);
  }

  get areCommandsValidToRun(): boolean {
    const commandsExcludingSkippedOnes = this.commands.filter((cmd) => !cmd.skipThisCommand);

    return commandsExcludingSkippedOnes.length > 0 && commandsExcludingSkippedOnes.every((cmd) => cmd.commandText !== "");
  }

  get isAnythingRunning(): boolean {
    return this.commands.length > 0 && this.commands.some((cmd) => cmd.status === CommandStatus.RUNNING);
  }

  /**
   * @throws {Error} if any of the commands are still running.
   */
  removeAllCommands(): void {
    if (this.isAnythingRunning) throw new Error("Can't remove all commands while some of them are still running.");

    this.clearWhatToDisplay();

    this.commands = [new Command(this)];
  }

  insertNewCommand(index: number): void {
    if (!(this.commands.isEmpty() && index === 0) && !(0 <= index && index <= this.commands.indexOfLastItem() + 1))
      throw new Error("Invalid index supplied");

    const newCommand = new Command(this);
    this.commands.insert(index, newCommand);
  }

  removeCommand(index: number): void {
    this.validateExistingIndex(index);

    const commandToRemove = this.commands[index];

    if (this.whatToDisplay?.commandId === commandToRemove.id) this.clearWhatToDisplay();

    this.commands.removeByIndex(index);

    // There commands list should never be empty (for user experience reasons)
    if (this.commands.isEmpty()) this.insertNewCommand(0);
  }

  moveCommandOnePositionUp(index: number): void {
    // Validate index
    if (index === 0) return; // Already at the top, no need to move.

    if (!(0 < index && index <= this.commands.indexOfLastItem())) throw new Error("Invalid index supplied");

    const commandToMove = this.commands[index];
    this.commands.removeByIndex(index);
    this.commands.insert(index - 1, commandToMove);
  }

  moveCommandOnePositionDown(index: number): void {
    // Validate index
    if (index === this.commands.indexOfLastItem()) return; // Already at the bottom, no need to move.

    if (!(0 <= index && index < this.commands.indexOfLastItem())) throw new Error("Invalid index supplied");

    const commandToMove = this.commands[index];
    this.commands.removeByIndex(index);
    this.commands.insert(index + 1, commandToMove);
  }

  // setShouldCache = (commandIndex: number, newValue: boolean) => {
  //   this.validateExistingIndex(commandIndex);

  //   this.commands.forEach((currentCommand, currentIndex) => {
  //     if (currentIndex <= commandIndex && newValue === true)
  //       currentCommand._shouldCache = true;
  //     else if (currentIndex >= commandIndex && newValue === false)
  //       currentCommand._shouldCache = false;
  //   });
  // };

  async runCommands(): Promise<void> {
    let commandsToRun: Command[];

    let precedingCommandsOfFirstCommandToRun: string[];
    let cacheToPassToFirstCommandToRun: string | undefined;

    const handleStdinError = (error: Error & { code: string; errno: string; syscall: string }, targetCommandName: string) => {
      if (error.code === "EPIPE" || error.code === "EOF") {
        // This happens when a write operation takes place after the writable stream (next command's stdin) is closed. Just ignore it.
      } else console.warn(`Error caught when passing output to the command "${targetCommandName}"`, { error, name: error.name });
    };

    const { indexOfCacheToUse } = this; // Extracted for use in lambda

    if (this.shouldUseCache && indexOfCacheToUse !== null) {
      if (this.indexOfCacheToUse === this.indexOfLastCommandThatIsntMarkedForSkip) {
        // eslint-disable-next-line no-console
        console.log("All commands already cached, no need to run, right?");
        return;
      }

      const [commandsAfterCache, _cachedCommands] = this.commands.splitByPredicate(
        (_cmd, cmdIndex) => cmdIndex > indexOfCacheToUse
      );

      commandsToRun = commandsAfterCache.filter((cmd) => !cmd.skipThisCommand);

      const cachedCommandToStartFrom = this.commands[indexOfCacheToUse];

      // Just an assertion
      if (cachedCommandToStartFrom.skipThisCommand)
        throw new Error(
          "Tried to use the cache of a command marked for skipping. This is a bug, please report it to the developer."
        );

      if (cachedCommandToStartFrom.precedingCommandsOnLastRun === null)
        throw new Error(
          "This command was run already, it's preceding commands list shouldn't be null. This is a bug, please report it to the developer."
        );

      precedingCommandsOfFirstCommandToRun = [
        ...cachedCommandToStartFrom.precedingCommandsOnLastRun,
        cachedCommandToStartFrom.commandText,
      ];
      cacheToPassToFirstCommandToRun = cachedCommandToStartFrom.stdout;

      // console.log(`used cached output of command #${indexOfCacheToUse + 1}: ${cachedCommandToStartFrom.commandText}`);
    } else {
      commandsToRun = this.commands.filter((cmd) => !cmd.skipThisCommand);
      precedingCommandsOfFirstCommandToRun = [];
    }

    const firstCommandToRun = commandsToRun[0];

    try {
      firstCommandToRun.startCommandAndRecordOutput(precedingCommandsOfFirstCommandToRun);
    } catch (e) {
      return;
    }

    if (cacheToPassToFirstCommandToRun) {
      // #region The shit I had to go through to capture errors that occur when writing to a process's stdin.
      // async function safelyWriteCacheToFirstCommandStdinAndEndTheStream(
      //   stdin: Writable,
      //   data: string
      // ) {
      //   /**
      //    * Simply calling `stdin.write(data)` can throw an uncatchable error if the stdin is closed in the middle of a long write operation.
      //    * Failed attempts:
      //    * - Checking the `stdin.destroyed` flag before writing
      //    * - Checking the `stdin.writeableEnded` flag before writing
      //    * - Chunking the input and checking `stdin.writeableEnded` before each chunk. This one lead to undeterministic behavior.
      //    * - Wrapping the `stdin.write(data)` line with try-catch
      //    * - Pass `stdin.write()` a callback that should get any error that occurs. The callback got the error, but didn't prevent it from being thrown.
      //    * - Calling `stdin.end(data)` instead of `stdin.write(data)`
      //    */

      //   // Register an awaitable callback that will capture any error occuring during the write operation
      //   const promise = new Promise((resolve, _reject) => {
      //     // Using once() and not on() to remove the listener after the first catch.
      //     stdin.once('error', (error) => resolve(error));

      //     // stdin.end(data, callback) can probably be used here, but I keep the `write()` just in case `end()`'s callback is called before the 'error' event, since the docs are not clear about that. (docs say: "The callback is invoked before 'finish' or on error." for node version 15.0.0. Is "on error" how node people say "after error"? idk.)
      //     stdin.write(
      //       data,
      //       (error) => {
      //         if (!error) resolve(null); // The condition is necessary because when an error occurs, the callback is called before the 'error' event handler
      //       } // Signal the promise to complete when the write operation is complete with no errors. I don't simply use this `error` parameter because the exception will still be thrown if I don't listen to the 'error' event, and the docs say: "If an error occurs, the callback may or may not be called with the error as its first argument. To reliably detect write errors, add a listener for the 'error' event.". If not resolved, the following `await promise` call will never finish if no error was thrown.
      //     );
      //   });

      //   const maybeError = await promise; // Should be null if no error was thrown.

      //   if (!maybeError) stdin.end();
      // }

      // if (firstCommandToRun.process?.stdin && lastCachedCommand.stdout)
      //   await safelyWriteCacheToFirstCommandStdinAndEndTheStream(
      //     firstCommandToRun.process.stdin,
      //     lastCachedCommand.stdout
      //   );
      // #endregion
      firstCommandToRun.process?.stdin?.on("error", (error: Error & { code: string; errno: string; syscall: string }) =>
        handleStdinError(error, firstCommandToRun.commandText)
      );
      process.nextTick(() => firstCommandToRun.process?.stdin?.end(cacheToPassToFirstCommandToRun)); // If I don't wrap it with `nextTick()`, the call to `end()` doesn't properly trigger the "finish" behavior of stdin on Ubuntu. Unfortunately I couldn't reproduce this issue in a unit test, nor in a nodejs interpreter. It feels like a bug, but I couldn't narrow it down to child_process/WritableStream/nodejs/electron.
    }

    let lastCommandRun = firstCommandToRun;

    for (const [currentCommand, nextCommand] of yieldPairs(commandsToRun)) {
      nextCommand.startCommandAndRecordOutput([...(currentCommand.precedingCommandsOnLastRun ?? []), currentCommand.commandText]);

      lastCommandRun = nextCommand;

      if (!(currentCommand.process?.stdout && nextCommand.process?.stdin)) throw new Error("Something went wrong");

      // #region Doing the following because calling currentCommand.process.stdout.pipe(nextCommand.process.stdin) might throw "Cannot call write after a stream was destroyed"
      const pipeToNextCommand = (chunk: any) => {
        if (!nextCommand.process?.stdin?.destroyed)
          // This condition is not necessary since the error will be caught somewhere else but it saves the log some unnecessary warnings.
          nextCommand.process?.stdin?.write(chunk);
      };
      nextCommand.process.stdin.on("close", () => {
        currentCommand.process?.stdout?.removeListener("data", pipeToNextCommand);

        if (this.killPredecessorOnClose) {
          // Kill the preceding process, to mimick the behavior of the shell's pipe operation. This also saves unnecessary run time of preceding commands.
          currentCommand.killIfProcessStillRunning("next-command-closed", "SIGPIPE"); // Technically signals don't work on Windows but the underlying 'kill-tree' package simply ignores the signal given if it's running on Windows. Git Bash somehow manages to pass SIGPIPE, I don't know how.}
        }
      });

      nextCommand.process.stdin.on("error", (error: Error & { code: string; errno: string; syscall: string }) =>
        handleStdinError(error, nextCommand.commandText)
      );

      currentCommand.process.stdout.on("data", pipeToNextCommand);

      currentCommand.process.stdout.on("close", () => {
        nextCommand.process?.stdin?.end();
      });
      // #endregion
    }

    this.whatToDisplay = { commandId: lastCommandRun.id, outputType: "stdout" };
  }

  // #region Cache stuff

  private _shouldUseCache = false;

  public get shouldUseCache(): boolean {
    return this._shouldUseCache;
  }

  public set shouldUseCache(v: boolean) {
    this._shouldUseCache = v;
  }

  private _indexOfDesiredCacheToUse = 0;

  public get indexOfDesiredCacheToUse(): number {
    return this._indexOfDesiredCacheToUse;
  }

  public set indexOfDesiredCacheToUse(v: number) {
    this._indexOfDesiredCacheToUse = v;
  }

  /** @returns {null} if no cache is available or if there are no commands (which should never happen, remember?) */
  public get indexOfLastCommandWithValidCache(): number | null {
    return this.commands.findLastIndex((cmd) => cmd.isValidCacheAvailable && !cmd.skipThisCommand);

    /* for (let i = this.commands.indexOfLastItem(); i >= 0; i--) {
      const command = this.commands[i];

      if (command.isValidCacheAvailable) return i;
    }

    return null; */

    // const [_, skippedCount] = this.commands.skip(
    //   (cmd) => cmd.isValidCacheAvailable
    // );

    // if (skippedCount === 0) return null;

    // return skippedCount - 1;
  }

  /** @returns {null} if no cache is available */
  public get indexOfCacheToUse() {
    if (this.indexOfLastCommandWithValidCache === null) return null;

    return this.commands.findLastIndex(
      (cmd, index) => index <= this.indexOfDesiredCacheToUse && cmd.isValidCacheAvailable && !cmd.skipThisCommand
    );
  }

  public get everythingIsCachedNoNeedToRun() {
    return this.shouldUseCache && this.indexOfCacheToUse === this.indexOfLastCommandThatIsntMarkedForSkip;
  }

  // #endregion

  public getCommandById(id: string): Command {
    const commandFound = this.commands.find((cmd) => cmd.id === id);

    if (!commandFound) throw new Error(`The command id "${id}" could not be found in the piperStore.`);

    return commandFound;
  }

  public getCommandsThatAreGoingToRunBeforeTheGivenCommand(givenCommandId: string): string[] {
    const result = [];

    for (const command of this.commands.filter((cmd) => !cmd.skipThisCommand)) {
      if (command.id === givenCommandId) break;
      else result.push(command.commandText);
    }

    return result;
  }

  /**
   * @throws {Error} if index is invalid
   */
  private validateExistingIndex(index: number) {
    if (!(0 <= index && index <= this.commands.indexOfLastItem())) throw new Error("Invalid index supplied");
  }

  private get indexOfLastCommandThatIsntMarkedForSkip() {
    return this.commands.findLastIndex((cmd) => !cmd.skipThisCommand);
  }
}

export const piperStore = new PiperStore();
