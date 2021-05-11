import React from "react";
import { Checkbox, makeStyles, Tooltip } from "@material-ui/core";
import { observer } from "mobx-react";
import { piperStore } from "../../../../PiperStore";
import { flexCol, flexColCentered, spaceChildren } from "../../../../JssUtils";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { BUTTON_HEIGHT, BUTTON_WIDTH, CacheBarButton, CacheBarButtonState } from "./CacheBarButton";
import clsx from "clsx";
import { availableCacheBarColor, cacheToUseBarColor } from "./Constants";
import { theme } from "../../../ThemeStuff/theme";

// const BUTTON_MARGIN = 61;
const COMMAND_HEIGHT = 106;
const DISTANCE_BETWEEN_BUTTONS = COMMAND_HEIGHT - BUTTON_HEIGHT + 6; /*the 6 is necessary, no idea why.*/
const BAR_WIDTH = BUTTON_WIDTH + 10;
const ALIGNMENT_BUFFER = 34; // pure magic. // 0.5 * COMMAND_HEIGHT - 19 ?
const CHECKBOX_HEIGHT = 24;

const barStyles: CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  left: 0,
  // marginLeft: "auto",
  // marginRight: "auto",
  width: BAR_WIDTH,
  borderTopLeftRadius: 5,
  borderTopRightRadius: 5,
  borderBottomLeftRadius: BAR_WIDTH / 2,
  borderBottomRightRadius: BAR_WIDTH / 2,
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.shortest,
  }),
  marginTop: 2,
};

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    minWidth: BAR_WIDTH,
    marginRight: 5,
    height: "fit-content",

    // backgroundColor: 'white',
    // borderStyle: 'solid',
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
    // borderTopLeftRadius: 5,
    // borderTopRightRadius: 5,
    // borderWidth: 2,
    // borderColor: darken(theme.palette.grey['300'], 0.1),
    // paddingLeft: 2,
    // paddingRight: 2,
    // "&$useCache": {
    //   borderColor: theme.palette.primary.light,
    // },
    paddingTop: 2,
    paddingBottom: 7,
  },
  buttonsAndCheckboxWrapper: {
    // marginTop: ALIGNMENT_BUFFER,
    ...flexColCentered,
  },
  availableCacheBar: {
    ...barStyles,
    // backgroundColor: theme.palette.grey['300'],
    backgroundColor: availableCacheBarColor(theme),
  },
  cacheToUseBar: {
    ...barStyles,
    // backgroundColor: lighten(theme.palette.primary.light, 0.6),
    backgroundColor: cacheToUseBarColor(theme),
  },
  buttonsWrapper: {
    marginTop: ALIGNMENT_BUFFER,
    ...spaceChildren(DISTANCE_BETWEEN_BUTTONS, "vertically"),
    // ...notLastChild({ marginBottom: BUTTON_MARGIN }),
    // ...directChildren({ marginTop: BUTTON_MARGIN }),
    ...flexCol,
    zIndex: 0, // To allow the tooltip to work for buttons with pointer events set to none
  },
  button: {},
  checkbox: {
    padding: 2,
    height: CHECKBOX_HEIGHT,
  },
  useCache: {},
  pointerEventsNone: { pointerEvents: "none" },
}));

function calculateBarHeight(numberOfButtons: number) {
  if (numberOfButtons === 0) return 0;

  return (
    CHECKBOX_HEIGHT +
    ALIGNMENT_BUFFER +
    DISTANCE_BETWEEN_BUTTONS * (numberOfButtons - 1) +
    numberOfButtons * BUTTON_HEIGHT +
    (BAR_WIDTH - BUTTON_WIDTH) / 2 +
    4
    // 1 // Pure magicnumber to make it prettier. Without it, it appears too short for some reason.
  );
}

function CoolButHardcodedCacheBar() {
  const cls = useStyles();

  const { useCache, indexOfCacheToUse, indexOfDesiredCacheToUse, indexOfLastCommandWithValidCache } = piperStore;

  const availableCacheBarHeight = calculateBarHeight(
    indexOfLastCommandWithValidCache === null ? 0 : indexOfLastCommandWithValidCache + 1
  );

  const cacheToUseBarHeight = calculateBarHeight(indexOfCacheToUse === null ? 0 : indexOfCacheToUse + 1);

  const buttons = piperStore.commands.map((command, commandIndex) => {
    let buttonState: CacheBarButtonState;
    let buttonTooltipText: string;

    if (piperStore.useCache === false) {
      buttonState = "disabled";
      buttonTooltipText = "";
    } else if (command.skipThisCommand) {
      buttonState = "disabled";
      buttonTooltipText = "Can't use this cache, this command is commented out";
    } else if (commandIndex === indexOfCacheToUse) {
      buttonState = "selected";
      buttonTooltipText = "This command's cache will be used for the next run";
    } else if (command.isValidCacheAvailable) {
      buttonState = "available";
      buttonTooltipText = "Click to use command's cache for the next run";
    } else {
      buttonState = "disabled";
      buttonTooltipText = "There's no valid cache available for this command yet";
    }

    return (
      <CacheBarButton
        key={command.id}
        className={cls.button}
        state={buttonState}
        tooltipText={buttonTooltipText}
        onClick={() => (piperStore.indexOfDesiredCacheToUse = commandIndex)}
      />
    );
  });

  return (
    <Tooltip title={piperStore.useCache ? "" : "Caching is disabled"} enterDelay={500} placement="top-end">
      <div
        className={clsx(cls.root, piperStore.useCache && cls.useCache, piperStore.isAnythingRunning && cls.pointerEventsNone)}
        onDoubleClick={(e) => {
          // For debugging
          if (e.ctrlKey)
            console.log(`Cache info: `, {
              useCache,
              indexOfCacheToUse,
              indexOfDesiredCacheToUse,
              indexOfLastCommandWithValidCache,
            });
        }}
      >
        {/* <Typography>Cache</Typography> */}
        <div
          className={cls.availableCacheBar}
          style={{
            height: availableCacheBarHeight,
          }}
        />
        <div
          className={cls.cacheToUseBar}
          style={{
            height: piperStore.useCache ? cacheToUseBarHeight : 0,
            opacity: piperStore.useCache ? 1 : 0,
          }}
        />
        <div className={cls.buttonsAndCheckboxWrapper}>
          <Tooltip title={"Use Cache"} placement="right">
            <Checkbox
              checked={piperStore.useCache}
              color="primary"
              className={cls.checkbox}
              onChange={(e) => (piperStore.useCache = e.target.checked)}
            />
          </Tooltip>
          <div className={cls.buttonsWrapper}>{buttons}</div>
        </div>
      </div>
    </Tooltip>
  );
}

export default observer(CoolButHardcodedCacheBar);
