import React from "react";
import { Button, ButtonProps, makeStyles } from "@material-ui/core";
import { ChevronRightRounded as ChevronRightRoundedIcon } from "@material-ui/icons";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    textTransform: "none",
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 6,
    transition: theme.transitions.create("all", {
      duration: theme.transitions.duration.shorter,
    }),
  },
  arrow: {
    "&$iconSizeSmall": {
      marginLeft: -2,
      marginRight: -4,
    },
  },
  iconSizeSmall: {},
  selected: {
    pointerEvents: "none",
    boxShadow: "none",
    border: "1px solid transparent", // This fucker is necessary so the border won't flicker
  },
  backgroundDiv: {
    backgroundColor: "white",
    borderRadius: 999,
  },
}));

export default function CuteRightPointingButton({
  children,
  selected,
  className,
  classes,
  ...rest
}: Omit<ButtonProps, "variant"> & { selected: boolean }) {
  const cls = useStyles();

  return (
    <div className={cls.backgroundDiv}>
      <Button
        size="small"
        className={clsx(cls.root, selected && cls.selected, className)}
        variant={selected ? "contained" : "outlined"}
        disableRipple
        endIcon={<ChevronRightRoundedIcon />}
        classes={{
          endIcon: cls.arrow,
          iconSizeSmall: cls.iconSizeSmall,
          ...classes,
        }}
        {...rest}
      >
        {children}
      </Button>
    </div>
  );
}
