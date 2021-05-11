import { Button, makeStyles, Tooltip } from "@material-ui/core";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { spaceChildren } from "../../../JssUtils";
import { piperStore } from "../../../PiperStore";
import { copyToClipboard } from "../../../utils";
import CoolButHardcodedCacheBar from "./CacheBar/CoolButHardcodedCacheBar";
import PlusDivider from "./PlusDivider";
import SingleCommandPanel from "./SingleCommandPanel";
import MousetrapWrapper from "../../Common/MousetrapWrapper";
import CopiedSuccessfulySnackbar from "../../Common/CopiedSuccessfulySnackbar";

const useStyles = makeStyles({
  root: { display: "flex", overflowY: "auto" },
  commandsWrapper: { flexGrow: 1 },
  // disabledButton: {},
  actionButtons: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  mainActionButtons: { ...spaceChildren(10) },
});

const CommandsPanel = observer(() => {
  const cls = useStyles();

  const commandsExceptSkippedOnes = piperStore.commands.filter((cmd) => !cmd.skipThisCommand);
  let entireCommandText = "";

  if (!commandsExceptSkippedOnes.isEmpty()) {
    entireCommandText = commandsExceptSkippedOnes
      .map((cmd) => cmd.commandText)
      .reduce((accumulator, cmdText) => `${accumulator} | ${cmdText}`);
  }

  const shouldDisableRunButton =
    commandsExceptSkippedOnes.isEmpty() ||
    !piperStore.areCommandsValidToRun ||
    piperStore.everythingIsCachedNoNeedToRun ||
    piperStore.isAnythingRunning;
  let runButtonTooltip = "";

  const someCommandsAreNotValid = "Some commands are not valid";
  if (shouldDisableRunButton) {
    if (commandsExceptSkippedOnes.isEmpty()) runButtonTooltip = "All commands are commented out";
    else if (piperStore.everythingIsCachedNoNeedToRun) runButtonTooltip = "Everything is already cached";
    else if (!piperStore.areCommandsValidToRun) runButtonTooltip = someCommandsAreNotValid;
    else if (piperStore.isAnythingRunning) runButtonTooltip = "Some commands are still running";
  }

  const [shouldOpenCopySnackbar, setShouldOpenCopySnackbar] = useState(false);
  const copyFinalCommandButtonTooltip = !piperStore.areCommandsValidToRun ? someCommandsAreNotValid : "";
  const shouldDisableCopyFinalCommandButton = !piperStore.areCommandsValidToRun;
  const copyFinalCommand = () => {
    copyToClipboard(entireCommandText);
    setShouldOpenCopySnackbar(true);
  };

  const shouldDisableRemoveAllCommandsButton = piperStore.isAnythingRunning;
  const plusDividersTitle =
    "Insert a new command here. When focused on a command, hitting `Enter` or `Ctrl+Alt+Down` will insert a new command below and hitting `Shift+Enter`, `Alt+Enter` or `Ctrl+Alt+Up` will insert a new command above.";

  return (
    <div className={cls.root}>
      <CoolButHardcodedCacheBar />
      <div className={cls.commandsWrapper}>
        <MousetrapWrapper
          shortcutsAndHandlers={[
            [
              // Run commands
              "ctrl+alt+enter",
              () => {
                if (!shouldDisableRunButton) piperStore.runCommands();
              },
            ],
            [
              // Remove all commands
              "ctrl+alt+d",
              () => {
                if (!shouldDisableRemoveAllCommandsButton) piperStore.removeAllCommands();
              },
            ],
            [
              // Copy final command
              "ctrl+alt+c",
              () => {
                if (!shouldDisableCopyFinalCommandButton) copyFinalCommand();
              },
            ],
          ]}
        >
          {piperStore.commands.map((cmd, index) => {
            const insertCommandAbove = () => piperStore.insertNewCommand(index);
            const insertCommandBelow = () => piperStore.insertNewCommand(index + 1);

            return (
              <div key={cmd.id}>
                <PlusDivider onClick={insertCommandAbove} disabled={piperStore.isAnythingRunning} title={plusDividersTitle} />
                <MousetrapWrapper
                  shortcutsAndHandlers={[
                    [["ctrl+alt+up", "alt+enter", "shift+enter"], insertCommandAbove],
                    [["ctrl+alt+down", "enter"], insertCommandBelow],
                  ]}
                >
                  <SingleCommandPanel command={cmd} commandIndex={index} disableChanges={piperStore.isAnythingRunning} />
                </MousetrapWrapper>
              </div>
            );
          })}
        </MousetrapWrapper>
        <PlusDivider
          onClick={() => piperStore.insertNewCommand(piperStore.commands.length)}
          disabled={piperStore.isAnythingRunning}
          title={plusDividersTitle}
        />
        <div className={cls.actionButtons}>
          <div className={cls.mainActionButtons}>
            <Tooltip title={runButtonTooltip}>
              <span>
                <Button
                  color="primary"
                  variant="contained"
                  disabled={shouldDisableRunButton}
                  onClick={() => piperStore.runCommands()}
                  title="Ctrl+Alt+Enter"
                >
                  Run!
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={copyFinalCommandButtonTooltip}>
              <span>
                <Button
                  disabled={shouldDisableCopyFinalCommandButton}
                  onClick={copyFinalCommand}
                  variant="outlined"
                  title="Ctrl+Alt+C"
                >
                  Copy final command
                </Button>
                <CopiedSuccessfulySnackbar open={shouldOpenCopySnackbar} onClose={() => setShouldOpenCopySnackbar(false)} />
              </span>
            </Tooltip>
          </div>
          <Tooltip title={piperStore.isAnythingRunning ? "Can't remove all commands while some of them are still running" : ""}>
            <span>
              <Button
                disabled={shouldDisableRemoveAllCommandsButton}
                onClick={() => piperStore.removeAllCommands()}
                variant="outlined"
                title="Ctrl+Alt+D"
              >
                Remove all commands
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

export default CommandsPanel;
