import { TextField, makeStyles, IconButton, Tooltip, Paper, ThemeProvider, fade, lighten, Icon } from "@material-ui/core";
import {
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  PanToolOutlined,
  PanToolTwoTone,
  KeyboardArrowUpRounded as KeyboardArrowUpRoundedIcon,
  KeyboardArrowDownRounded as KeyboardArrowDownRoundedIcon,
} from "@material-ui/icons";
import clsx from "clsx";

import { observer } from "mobx-react";
import React, { useEffect, useRef } from "react";
import Command from "../../../Command";
import CommandStatus from "../../../CommandStatus";
import { flexCol, lowProfileButtonColors, spaceChildren } from "../../../JssUtils";
import { piperStore } from "../../../PiperStore";
import CircularProgress from "../../Common/CircularProgress";
import MousetrapWrapper from "../../Common/MousetrapWrapper";
import { errorTheme } from "../../ThemeStuff/theme";
import CuteRightPointingButton from "./CuteRightPointingButton";

function confirmTheUserWantsToKillTheProcess() {
  return window.confirm("Are you sure you want to stop this running process?");
}

const skipColor = "#6A9955";
const useStyles = makeStyles((theme) => ({
  // commandAndOutputStuff: {
  //   display: "flex",
  //   flexDirection: "column",
  //   flexGrow: 1,
  // },
  container: {
    display: "flex",
    alignItems: "center",
    padding: 5,
    ...spaceChildren(5),
  },
  deleteButton: {
    // margin: 10,
    ...lowProfileButtonColors(theme),
    padding: 2,
  },
  errorButton: { color: "red", padding: 0 },
  stopCommandButton: { paddingRight: 16 }, // to make up for the thumb sticking out, feels unnatural
  commandStoppedButton: { color: lighten("#000", 0.55) },
  colorRed: {
    color: "red",
  },
  successfulExitAdornment: { color: "green" },
  adornmentsContainer: {
    display: "flex",
    alignItems: "center",
    ...spaceChildren(5),
  },
  outputButtons: {
    ...flexCol,
    justifyContent: "center",
    ...spaceChildren(6, "vertically"),
  },
  textField: {
    flexGrow: 1,
    // fontFamily: 'monospace',
  },
  outputButton: { height: 30, width: 67 },
  buttonDimmedOutline: {
    border: "1px solid rgba(0, 0, 0, 0.15)",
  },
  buttonOutlinedPrimaryEnhanced: {
    // Stolen and modified from material-ui's source code
    color: theme.palette.primary.main,
    // border: `1px solid ${lighten(theme.palette.primary.main, 0.25)}`,
    border: `1px solid ${theme.palette.primary.main}`,
    "&:hover": {
      border: `1px solid ${theme.palette.primary.main}`,
      backgroundColor: fade(theme.palette.primary.main, theme.palette.action.hoverOpacity),
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  skipButton: {
    padding: 0,
    color: lighten("#000", 0.9),
    "&:hover": {
      color: lighten(skipColor, 0.5),
      cursor: "pointer",
    },
    // transform: 'translateY(-1px)',
    marginLeft: -8,
    marginRight: 4,
    height: "unset",
    width: "unset",
  },
  skipColor: { color: skipColor },
  skipBackgroundColor: { backgroundColor: lighten("#000", 0.93) },
  moveArrowsContainer: { ...flexCol },
  moveArrow: { padding: 0, ...lowProfileButtonColors(theme) },
}));

const SingleCommandPanel = observer(
  ({ command, commandIndex, disableChanges }: { command: Command; commandIndex: number; disableChanges: boolean }) => {
    const cls = useStyles();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => command.setInputRef(inputRef)); // Wrapped in useEffect because inputRef.current is only guaranteed to not be null when the component is mounted

    const askKillRunningCommand = () => {
      if (!confirmTheUserWantsToKillTheProcess()) return;

      command.killIfProcessStillRunning("manual");
    };

    // #region figure out the endAdornment

    let endAdornments;

    if (command.skipThisCommand) endAdornments = "";
    else if (command.status === CommandStatus.RUNNING)
      endAdornments = (
        <>
          <Tooltip title="Kill running process (and child processes)">
            <IconButton className={cls.stopCommandButton} onClick={askKillRunningCommand}>
              <PanToolTwoTone />
            </IconButton>
          </Tooltip>
          <CircularProgress size="1.5em" />
        </>
      );
    else if (command.status === CommandStatus.ERROR)
      endAdornments = (
        <Tooltip title={command.executionError ?? `Exited with code ${command.process?.exitCode}`}>
          {command.stderr ? (
            <IconButton
              className={cls.errorButton}
              onClick={() => {
                piperStore.whatToDisplay = {
                  commandId: command.id,
                  outputType: "stderr",
                };
              }}
            >
              <ErrorIcon />
            </IconButton>
          ) : (
            <ErrorIcon style={{ color: "red" }} />
          )}
        </Tooltip>
      );
    else if (command.killed) {
      let tooltipTitle: string;

      switch (command.status) {
        case CommandStatus.KILLED_MANUALLY:
          tooltipTitle = "You stopped this command.";
          break;
        case CommandStatus.KILLED_UNKNOWN_REASON:
          tooltipTitle = "This command was stopped for an unknown reason.";
          break;
        case CommandStatus.KILLED_NEXT_COMMAND_CLOSED:
          tooltipTitle = "This command was automatically stopped because the next command's stdin stream was closed.";
          break;

        default:
          throw new Error(`Unsupported kill status "${command.status}" is not supported.`);
      }

      endAdornments = (
        <Tooltip title={tooltipTitle}>
          <PanToolOutlined
            className={clsx(cls.commandStoppedButton, command.status === CommandStatus.KILLED_UNKNOWN_REASON && cls.colorRed)}
          />
        </Tooltip>
      );
    } else if (command.status === CommandStatus.EXITED)
      endAdornments = (
        <Tooltip title={`Exited with code ${command.process?.exitCode}`}>
          <CheckIcon className={cls.successfulExitAdornment} />
        </Tooltip>
      );

    // #endregion

    const askRemoveCommand = () => {
      if (command.status === CommandStatus.RUNNING) {
        if (confirmTheUserWantsToKillTheProcess()) command.killIfProcessStillRunning("manual");
        else return;
      }

      piperStore.removeCommand(commandIndex);

      if (commandIndex === 0) piperStore.commands[0].focusOnThisCommandIfPossible();
      else piperStore.commands[commandIndex - 1].focusOnThisCommandIfPossible();
    };

    const toggleSkip = () => {
      command.skipThisCommand = !command.skipThisCommand;
    };

    let selectedButton: "stdout" | "stderr" | null = null;

    const { whatToDisplay } = piperStore;
    if (!whatToDisplay || whatToDisplay.commandId !== command.id) selectedButton = null;
    else selectedButton = whatToDisplay.outputType;

    const shouldDisableArrowUp = commandIndex === 0;
    const shouldDisableArrowDown = commandIndex === piperStore.commands.indexOfLastItem();
    const moveUp = () => piperStore.moveCommandOnePositionUp(commandIndex);
    const moveDown = () => piperStore.moveCommandOnePositionDown(commandIndex);
    const focusOnPreviousCommand = () => {
      if (commandIndex !== 0) piperStore.commands[commandIndex - 1].focusOnThisCommandIfPossible();
    };
    const focusOnNextCommand = () => {
      if (commandIndex !== piperStore.commands.indexOfLastItem())
        piperStore.commands[commandIndex + 1].focusOnThisCommandIfPossible();
    };

    return (
      <MousetrapWrapper
        shortcutsAndHandlers={[
          ["ctrl+/", toggleSkip],
          [["ctrl+d", "alt+del", "alt+backspace"], askRemoveCommand],
          ["alt+up", moveUp],
          ["alt+down", moveDown],
          ["up", focusOnPreviousCommand],
          ["down", focusOnNextCommand],
        ]}
      >
        <Paper
          className={cls.container}
          elevation={3}
          onDoubleClick={(e) => {
            // For debugging
            if (e.ctrlKey) {
              (window as any).cmd = command;
              // eslint-disable-next-line no-console
              console.log(`Command #${commandIndex + 1}, "${command.commandText}" saved as "cmd": `, command);
            }
          }}
        >
          {/* <Checkbox
          disabled={
            !piperStore.useCache ||
            piperStore.indexOfLastCommandWithValidCache === null ||
            piperStore.indexOfLastCommandWithValidCache < commandIndex
          }
          checked={
            piperStore.indexOfDesiredCacheToUseOrLastAvailableCache !== null &&
            piperStore.indexOfDesiredCacheToUseOrLastAvailableCache >=
              commandIndex
          }
          onClick={() => (piperStore.indexOfDesiredCacheToUse = commandIndex)}
          style={{ paddingLeft: 0 }}
        /> */}
          <TextField
            className={cls.textField}
            disabled={disableChanges}
            placeholder="Enter a command"
            variant="outlined"
            autoFocus
            error={
              ![0, null, undefined].includes(command.process?.exitCode) &&
              !command.killed &&
              !command.isCommandDifferentThanWhenLastExecuted
            }
            value={command.commandText}
            onChange={(e) => {
              command.commandText = e.target.value;
            }}
            inputProps={{
              className: clsx(command.skipThisCommand && cls.skipColor),
            }}
            InputProps={{
              className: clsx(command.skipThisCommand && cls.skipBackgroundColor),
              title: command.skipThisCommand ? "This command will be skipped" : "",
              startAdornment: (
                <Icon
                  className={clsx(cls.skipButton, command.skipThisCommand && cls.skipColor)}
                  onClick={toggleSkip}
                  title={`Click to ${command.skipThisCommand ? "un-" : ""}skip this command (Ctrl+/)`}
                >
                  #
                </Icon>
              ),
              endAdornment: <div className={cls.adornmentsContainer}>{endAdornments}</div>,
            }}
            inputRef={inputRef}
          />
          <div className={cls.moveArrowsContainer}>
            <IconButton
              className={cls.moveArrow}
              title="Move command up (Alt+Up)"
              disabled={shouldDisableArrowUp}
              style={shouldDisableArrowUp ? { color: lighten("#000", 0.93) } : {}} // Not using classes/className because Material UI takes higher specificity
              onClick={moveUp}
            >
              <KeyboardArrowUpRoundedIcon />
            </IconButton>
            <IconButton
              className={cls.moveArrow}
              title="Move command down (Alt+Down)"
              disabled={shouldDisableArrowDown}
              style={shouldDisableArrowDown ? { color: lighten("#000", 0.93) } : {}} // Not using classes/className because Material UI takes higher specificity
              onClick={moveDown}
            >
              <KeyboardArrowDownRoundedIcon />
            </IconButton>
          </div>
          <IconButton
            className={cls.deleteButton}
            onClick={askRemoveCommand}
            disabled={disableChanges}
            title="Remove this command (`Ctrl+D`, `Alt+Del` or `Alt+Backspace`)"
          >
            <DeleteIcon />
          </IconButton>
          <div className={cls.outputButtons}>
            <CuteRightPointingButton
              className={cls.outputButton}
              selected={selectedButton === "stdout"}
              color={command.stdout ? "primary" : "default"}
              onClick={() => {
                piperStore.whatToDisplay = {
                  commandId: command.id,
                  outputType: "stdout",
                };
              }}
              classes={
                command.stdout ? { outlinedPrimary: cls.buttonOutlinedPrimaryEnhanced } : { outlined: cls.buttonDimmedOutline }
              }
              title="From the last run"
            >
              stdout
            </CuteRightPointingButton>
            <ThemeProvider theme={errorTheme}>
              <CuteRightPointingButton
                selected={selectedButton === "stderr"}
                color={command.stderr ? "primary" : "default"}
                className={cls.outputButton}
                onClick={() => {
                  piperStore.whatToDisplay = {
                    commandId: command.id,
                    outputType: "stderr",
                  };
                }}
                classes={command.stderr ? {} : { outlined: cls.buttonDimmedOutline }}
                title="From the last run"
              >
                stderr
              </CuteRightPointingButton>
            </ThemeProvider>
          </div>
        </Paper>
      </MousetrapWrapper>
    );
  }
);

export default SingleCommandPanel;
