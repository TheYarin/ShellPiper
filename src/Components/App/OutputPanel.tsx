import { Fab, makeStyles } from "@material-ui/core";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { FileCopy as CopyIcon } from "@material-ui/icons";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { piperStore } from "../../PiperStore";
import { copyToClipboard } from "../../utils";
import CopiedSuccessfulySnackbar from "../Common/CopiedSuccessfulySnackbar";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    height: "100%",
    // backgroundColor: '#333333',
    // color: 'white',
    backgroundColor: theme.constants.consoleBackground,
    color: theme.constants.consoleTextColor,
    boxSizing: "border-box",
  },
  pre: {
    paddingBottom: 55, // So the fab won't cover some text in an unevadable way
    height: "100%",
    overflowY: "auto",
    boxSizing: "border-box",
    padding: 10,
    margin: 0,
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
  },
  copyIcon: {
    fontSize: "1.1rem",
  },
}));

const OutputPanel = observer((/* { output }: { output: string } */) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [openCopySnackbar, setOpenCopySnackbar] = useState(false);

  let output: string | undefined;

  // const output = piperStore.commands.lastOrUndefined()?.stdout || '';

  if (piperStore.whatToDisplay) {
    const { commandId, outputType } = piperStore.whatToDisplay;
    output = piperStore.getCommandById(commandId)[outputType];
  }

  const cls = useStyles();

  return (
    <div className={cls.root}>
      <pre className={cls.pre} title="Double tap `Escape` to clear" tabIndex={-1} /* for nav keys to work */>
        {output}
      </pre>
      <Fab
        disabled={!output}
        className={cls.fab}
        size="small"
        color="primary"
        onClick={() => {
          if (!output) throw new Error("Shouldn't happen because of the 'disabled' prop");

          copyToClipboard(output);
          setOpenCopySnackbar(true);
        }}
      >
        <CopyIcon className={cls.copyIcon} />
      </Fab>
      <CopiedSuccessfulySnackbar open={openCopySnackbar} onClose={() => setOpenCopySnackbar(false)} />
    </div>
  );
});

export default OutputPanel;
