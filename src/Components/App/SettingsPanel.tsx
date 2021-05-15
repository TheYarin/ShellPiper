import { Button, Checkbox, Collapse, FormControlLabel, makeStyles, Paper, TextField, Theme } from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon, Settings as SettingsIcon } from "@material-ui/icons";
import clsx from "clsx";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { flexCol, spaceChildren } from "../../JssUtils";
import { piperStore } from "../../PiperStore";
import { doesDirectoryExist, doesFileExist } from "../../utils";
import HelpPopup from "../Common/HelpPopup";
import BrowseButton from "./BrowseButton";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: "15px 5px",
    position: "relative",
    marginBottom: 20,
    paddingBottom: 25,
    ...flexCol,
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  expandArrow: {
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandButton: {
    position: "absolute",
    bottom: 0,

    // Align to the center
    left: 0,
    right: 0,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",

    // Make it exceed the parent justttt right
    transform: "translateY(50%)",

    backgroundColor: "#f7f7f7",
    borderRadius: 9999, // Couldn't find a more elegant way

    paddingLeft: 5,
    paddingRight: 5,
  },
  expandedPart: {
    marginTop: 15,
    ...flexCol,
    ...spaceChildren(15, "vertically"),
  },
  rotated: {
    transform: "rotate(-180deg)",
  },
  killCheckboxContainer: {
    paddingLeft: 5,
    display: "flex",
    alignItems: "center",
  },
  checkboxFormControllLabel: {
    marginRight: 4,
  },
}));

const SettingsPanel = observer(() => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [panelExpanded, setPanelExpanded] = useState(false);

  const cls = useStyles();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const workingDirectoryDoesntExist =
    piperStore.workingDirectory !== undefined && !doesDirectoryExist(piperStore.workingDirectory);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const shellProgramExists = piperStore.shellProgram !== undefined && !doesFileExist(piperStore.shellProgram);

  return (
    <Paper className={cls.root} elevation={4}>
      <TextField
        label="Working Directory"
        variant="outlined"
        value={piperStore.workingDirectory || ""}
        onChange={(e) => {
          piperStore.workingDirectory = e.target.value || undefined;
        }}
        error={workingDirectoryDoesntExist}
        helperText={workingDirectoryDoesntExist ? "This directory doesn't exist." : ""}
        inputProps={{ tabIndex: 1 }}
        InputProps={{
          endAdornment: (
            <BrowseButton
              dialogOptions={{
                properties: ["openDirectory"],
              }}
              onValue={(ret) => {
                piperStore.workingDirectory = ret.filePaths[0];
              }}
            />
          ),
        }}
      />
      <Collapse in={panelExpanded} unmountOnExit>
        <div className={cls.expandedPart}>
          <TextField
            label="Shell Program"
            variant="outlined"
            value={piperStore.shellProgram || ""}
            onChange={(e) => {
              piperStore.shellProgram = e.target.value || undefined;
            }}
            error={shellProgramExists}
            helperText={shellProgramExists ? "This file doesn't exist." : ""}
            inputProps={{ tabIndex: 1 }}
            InputProps={{
              endAdornment: (
                <BrowseButton
                  dialogOptions={{
                    properties: ["openFile"],
                  }}
                  onValue={(ret) => {
                    piperStore.shellProgram = ret.filePaths[0];
                  }}
                />
              ),
            }}
          />
          <TextField
            label="PATH environment variable"
            variant="outlined"
            value={piperStore.pathEnvVar || ""}
            onChange={(e) => {
              piperStore.pathEnvVar = e.target.value || undefined;
            }}
            inputProps={{ tabIndex: 1 }}
          />
          <div className={cls.killCheckboxContainer}>
            <FormControlLabel
              className={cls.checkboxFormControllLabel}
              control={
                <Checkbox
                  checked={piperStore.killPredecessorOnClose}
                  color="primary"
                  onChange={(e) => {
                    piperStore.killPredecessorOnClose = e.target.checked;
                  }}
                />
              }
              label="Kill preceding command(s) when a command is done"
            />
            <HelpPopup
              title="Killing preceding command(s)"
              text="The shell usually kills the preceding command (with a SIGPIPE) when the command following it exits, which kills the one before it and so on. This saves unnecessary runtime, but leaves you with only a partial output. That partial output might not be useful as a cache."
            />
          </div>
        </div>
      </Collapse>
      <Button className={cls.expandButton} variant="contained" onClick={() => setPanelExpanded(!panelExpanded)} disableRipple>
        <SettingsIcon />
        <ExpandMoreIcon className={clsx(cls.expandArrow, panelExpanded && cls.rotated)} />
      </Button>
    </Paper>
  );
});

export default SettingsPanel;
