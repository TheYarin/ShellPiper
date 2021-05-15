import { makeStyles, Divider, Paper } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import clsx from "clsx";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    margin: "6px 0",
    cursor: "pointer",
    "&:hover $divider": {
      backgroundColor: "#44444470",
      height: 2,
    },
    "&:hover $plus": {
      boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)", // Shamelessly stolen from Material-UI Paper's elevation-5 styling
    },
    "&$disabled": {
      pointerEvents: "none",
    },
  },
  divider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    marginTop: "auto",
    marginBottom: "auto",
    // top: "50%",
    width: "100%",
    backgroundColor: "#44444444",
    borderRadius: 99999999,
  },
  plus: {
    padding: 0,
    borderRadius: 12,
    minWidth: 0,
    width: 24,
    height: 24,

    backgroundColor: theme.palette.grey.A100,
    zIndex: 1,
    transition: "box-shadow 0ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",

    "&$disabled": {
      color: theme.palette.grey[400],
    },
  },
  disabled: {},
}));

const PlusDivider = ({
  onClick,
  title,
  disabled,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  title: string | undefined;
  disabled: boolean | undefined;
}) => {
  const cls = useStyles();

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div className={clsx(cls.root, disabled && cls.disabled)} onClick={onClick} title={title} role="button">
      <Divider className={cls.divider} variant="middle" />
      <Paper elevation={disabled ? 0 : 3} className={clsx(cls.plus, disabled && cls.disabled)}>
        <AddIcon />
      </Paper>
    </div>
  );
};

export default PlusDivider;
