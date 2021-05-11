import { ChildProcess, exec } from "child_process";
import crypto from "crypto";
import { action, makeAutoObservable } from "mobx";
import React from "react";
import treeKill from "tree-kill";
import CommandStatus from "./CommandStatus";
// eslint-disable-next-line import/no-cycle
import { PiperStore } from "./PiperStore";

export default class Command {
  // #region id property

  private _id = crypto.randomBytes(16).toString("hex");

  public get id(): string {
    return this._id;
  }

  // #endregion

  // #region commandText

  private _commandText = "";

  public get commandText(): string {
    return this._commandText;
  }

  public set commandText(v: string) {
    this._commandText = v;
  }

  // #endregion

  stdout?: string = undefined;

  stderr?: string = undefined;

  /**
   * Contains the text of the command from when it was last executed.
   */
  private _lastCommandRun?: string;

  private _precedingCommandsOnLastRun: string[] | null = null;

  public get precedingCommandsOnLastRun(): string[] | null {
    return this._precedingCommandsOnLastRun;
  }

  private _piperStore: PiperStore;

  // #region skipThisCommand

  private _skipThisCommand = false;

  public get skipThisCommand(): boolean {
    return this._skipThisCommand;
  }

  public set skipThisCommand(v: boolean) {
    this._skipThisCommand = v;
  }

  // #endregion

  // #region Execution error

  private _executionError: string | undefined;

  public get executionError(): string | undefined {
    return this._executionError;
  }
  // public set executionError(v : string | undefined) {
  //   this._executionError = v;
  // }

  // #endregion

  // #region status property

  /**
   * Status is managed independently for two reasons:
   * 1. Because the ChildProcess class doesn't supply a proper API to get the process's status
   * 2. So Mobx can work it's magic with the status, which would probable not be straight-forward if the value was managed by the ChildProcess class.
   */
  private _status: CommandStatus = CommandStatus.NEW;

  public get status(): CommandStatus {
    return this._status;
  }

  /**
   * Not using a setter because Mobx is raising a warning when using a setter even though it doesn't seem like the warning is in place. The warning is: [MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed.
   */
  private setStatus(newStatus: CommandStatus) {
    this._status = newStatus;
  }

  // #endregion

  public get killed(): boolean {
    return [
      CommandStatus.KILLED_MANUALLY,
      CommandStatus.KILLED_NEXT_COMMAND_CLOSED,
      CommandStatus.KILLED_UNKNOWN_REASON,
    ].includes(this.status);
  }

  // #region wasLastKilled property

  // private _wasManuallyKilled: boolean = false;
  // public get wasManuallyKilled(): boolean {
  //   return this._wasManuallyKilled;
  // }
  // private setWasManuallyKilled(v: boolean) {
  //   this._wasManuallyKilled = v;
  // }

  // #endregion

  get isCommandDifferentThanWhenLastExecuted() {
    return this._lastCommandRun !== this.commandText;
  }

  public get isValidCacheAvailable(): boolean {
    return (
      this.status !== CommandStatus.RUNNING &&
      this.stdout !== undefined &&
      !this.isCommandDifferentThanWhenLastExecuted &&
      this.precedingCommandsOnLastRun !== null &&
      this.precedingCommandsOnLastRun.equals(this._piperStore.getCommandsThatAreGoingToRunBeforeTheGivenCommand(this.id))
    );
  }

  process?: ChildProcess;

  constructor(piperStore: PiperStore) {
    this._piperStore = piperStore;
    makeAutoObservable(this);
  }

  killIfProcessStillRunning(killReason: "manual" | "next-command-closed", signal: string | number | undefined = undefined) {
    if (this.status !== CommandStatus.RUNNING) return;

    if (!this.process) throw new Error("Something went horribly wrong. This command's process member is falsey.");

    treeKill(this.process.pid, signal);

    switch (killReason) {
      case "manual":
        this.setStatus(CommandStatus.KILLED_MANUALLY);
        break;
      case "next-command-closed":
        this.setStatus(CommandStatus.KILLED_NEXT_COMMAND_CLOSED);
        break;

      default:
        throw new Error(`killReason value "${killReason}" is not supported.`);
    }
  }

  /**
   * @throws {Error} if starting the process failed.
   */
  startCommandAndRecordOutput(precedingCommands: string[] | null): void {
    this._resetExecutionData();

    const { workingDirectory, shellProgram, pathEnvVar } = this._piperStore;

    try {
      this.process = exec(this.commandText, {
        cwd: workingDirectory,
        shell: shellProgram,
        env: { PATH: pathEnvVar },
        maxBuffer: Infinity,
      });
    } catch (e) {
      this.setStatus(CommandStatus.ERROR);
      this._executionError = "Failed to even start the command. Did you mess with the 'Shell Program' config?";
      console.error(e);
      throw e;
    }

    this.setStatus(CommandStatus.RUNNING);

    // this.process?.on("error", (e) => {
    //   this.setStatus(CommandStatus.ERROR);
    //   alert(
    //     "Failed to even start the process. Something's very wrong. Make sure you didn't put any garbage in the Shell Program field."
    //   );
    // });

    const saveCommandStdout = action((data: string) => {
      if (this.stdout === undefined) this.stdout = "";
      this.stdout += data;
    });

    const saveCommandStderr = action((data: string) => {
      if (this.stderr === undefined) this.stderr = "";
      this.stderr += data;
    });

    this.process.stdout?.on("data", saveCommandStdout);
    this.process.stderr?.on("data", saveCommandStderr);
    // this.process.stdin?.on('data', this.saveCommandStderr);
    this.process.on("exit", (exitCode) => {
      if ([CommandStatus.KILLED_MANUALLY, CommandStatus.KILLED_NEXT_COMMAND_CLOSED].includes(this.status)) {
        // Status already set, do nothing.
      } else if (exitCode !== null) {
        if (exitCode === 0) this.setStatus(CommandStatus.EXITED);
        else this.setStatus(CommandStatus.ERROR);
      } else if (this.process?.killed) this.setStatus(CommandStatus.KILLED_UNKNOWN_REASON);
      else console.error("Something weird is going on: the exitCode is null but this.process.killed is not true.");
    });

    this.process.on("error", (...e: unknown[]) => {
      console.warn(`error occured when running command "${this.commandText}"`, e);
      this.setStatus(CommandStatus.ERROR);
    });

    this._lastCommandRun = this.commandText;
    this._precedingCommandsOnLastRun = precedingCommands ?? [];
  }

  // #region input ref stuff

  private _inputRef?: React.RefObject<HTMLInputElement>;

  public setInputRef(ref: React.RefObject<HTMLInputElement>) {
    this._inputRef = ref;
  }

  public focusOnThisCommandIfPossible() {
    this._inputRef?.current?.focus();
  }

  // #endregion

  private _resetExecutionData() {
    this.stdout = undefined;
    this.stderr = undefined;
    this.setStatus(CommandStatus.NEW);
    this.process = undefined;
    this._executionError = undefined;
  }
}
