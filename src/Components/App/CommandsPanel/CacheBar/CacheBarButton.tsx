import { Button, ButtonProps, lighten, makeStyles, Tooltip } from "@material-ui/core";
import clsx from "clsx";
import React from "react";

export const BUTTON_RADIUS = 10;
export const BUTTON_HEIGHT = BUTTON_RADIUS * 2;
export const BUTTON_WIDTH = BUTTON_HEIGHT;
const SMALL_BUTTON_DIFF = 6;
const SMALL_BUTTON_HEIGHT = BUTTON_HEIGHT - SMALL_BUTTON_DIFF;
const SMALL_BUTTON_WIDTH = BUTTON_WIDTH - SMALL_BUTTON_DIFF;

const useStyles = makeStyles((theme) => ({
  button: {
    padding: 0,
    borderRadius: BUTTON_RADIUS,
    minWidth: 0,
    width: SMALL_BUTTON_WIDTH,
    height: SMALL_BUTTON_HEIGHT,
    transition: theme.transitions.create(["all"], {
      duration: theme.transitions.duration.shortest,
    }),
  },
  buttonContained: {
    "&$disabled": { backgroundColor: theme.palette.grey.A100 },
  },
  disabled: {},
  selected: {
    cursor: "default",
    pointerEvents: "none",
    height: BUTTON_HEIGHT,
    width: BUTTON_WIDTH,
  },
  available: {
    backgroundColor: lighten(theme.palette.primary.main, 0.21),
    "&:hover": {
      backgroundColor: lighten(theme.palette.primary.main, 0.1),
    },
  },
  containerPadding: {
    padding: SMALL_BUTTON_DIFF / 2,
    transition: theme.transitions.create(["padding"], {
      duration: theme.transitions.duration.shortest,
    }),
  },
  noPadding: { padding: 0 },
}));

export type CacheBarButtonState = "disabled" | "available" | "selected";

type CacheBarButtonProps = Omit<ButtonProps, "color" | "variant" | "disabled"> & {
  state: CacheBarButtonState;
  tooltipText: string;
};

export function CacheBarButton({ state, className, classes, tooltipText, ...rest }: CacheBarButtonProps) {
  const cls = useStyles();

  return (
    <div className={clsx(cls.containerPadding, state === "selected" && cls.noPadding)}>
      <Tooltip title={tooltipText} placement="right" enterDelay={400}>
        <span
          style={{
            display:
              "flex" /* It's necessary for the height to be the same as the span's content's height, but I don't know why :( */,
          }}
        >
          <Button
            className={clsx(
              cls.button,
              className,
              state === "selected" && cls.selected,
              // state === 'available' && cls.available
              ["on", "available"].includes(state) && cls.available
            )}
            variant="contained"
            color={state === "selected" ? "primary" : "default"}
            classes={{
              contained: cls.buttonContained,
              disabled: cls.disabled,
              ...classes,
            }}
            disableRipple
            disabled={state === "disabled"}
            {...rest}
          />
        </span>
      </Tooltip>
    </div>
  );
}
