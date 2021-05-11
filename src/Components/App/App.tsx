import OutputPanel from "./OutputPanel";
import { Divider, makeStyles, ThemeProvider } from "@material-ui/core";
import { Observer } from "mobx-react";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import icon from '../assets/icon.svg';
import "./App.global.css";
import { piperStore } from "../../PiperStore";
import CommandsPanel from "./CommandsPanel/CommandsPanel";
import SettingsPanel from "./SettingsPanel";
import { flexCol } from "../../JssUtils";
import { theme } from "../ThemeStuff/theme";
import ResizePanel from "react-resize-panel";

import MousetrapWrapper from "../Common/MousetrapWrapper";

const maxWidthOfCommandsPanel = 800;

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
  },
  commandsPanel: {
    // flexGrow: 1,
    padding: "0 10px 10px 10px",
    ...flexCol,
    backgroundColor: "#F0F2F5",
    width: maxWidthOfCommandsPanel,
    boxSizing: "border-box",
    minWidth: 400, // Limits the minimal size of the resizable panel
  },
  commandsPanelResizableContainer: {
    // flexGrow: 2,
    maxWidth: maxWidthOfCommandsPanel,
    width: 500, // Initial width of the resizable commands panel
    minWidth: "fit-content", // Makes sure the commands panel isn't truncated by the manual resizing
  },
  resizeHandle: {
    // "&:active": {
    //   width: 10,
    //   height: "100%",
    //   backgroundColor: "blue",
    // },
  },
  outputPanel: {
    flex: "1 1 0",
    minWidth: 200,
    overflowY: "auto",
    overflowX: "auto",
  },
  divider: {},
  mousetrapContainer: { width: "100%", height: "100%" },
});

const Main = () => {
  const cls = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <MousetrapWrapper
        className={cls.mousetrapContainer}
        shortcutsAndHandlers={[["esc esc", () => piperStore.clearWhatToDisplay()]]}
      >
        <div className={cls.root}>
          <ResizePanel direction="e" containerClass={cls.commandsPanelResizableContainer} handleClass={cls.resizeHandle}>
            <div
              className={cls.commandsPanel}
              onDoubleClick={(e) => {
                // For debugging
                if (e.target !== e.currentTarget) return; // Don't run when clicked on children, only when clicked directly on this div

                if (e.ctrlKey) {
                  const windowAny = window as any;
                  windowAny.piperStore = windowAny.ps = piperStore;
                  console.log(`piperStore set: `, piperStore);
                }
              }}
            >
              <SettingsPanel />
              <CommandsPanel />
            </div>
          </ResizePanel>
          <Divider className={cls.divider} orientation="vertical" flexItem />
          <div className={cls.outputPanel}>
            <OutputPanel
            // output={piperStore.commands.last()?.lastStdout || ''}
            />
          </div>
        </div>
      </MousetrapWrapper>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  );
}
