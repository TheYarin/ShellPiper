import React, { useState } from "react";
import { Button, ButtonProps, makeStyles } from "@material-ui/core";
import { remote, OpenDialogOptions } from "electron";

const { dialog } = remote;

const useStyles = makeStyles({ root: {} });

type BrowseButtonProps = Omit<ButtonProps, "onClick"> & {
  onValue: (value: Electron.OpenDialogReturnValue) => void;
  dialogOptions: OpenDialogOptions;
};

export default function BrowseButton({ onValue, dialogOptions, ...rest }: BrowseButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const classes = useStyles();

  return (
    <Button
      variant="contained"
      className={classes.root}
      disabled={isDialogOpen}
      onClick={async () => {
        setIsDialogOpen(true);
        const ret = await dialog.showOpenDialog(dialogOptions);
        setIsDialogOpen(false);
        onValue(ret);
      }}
      {...rest}
    >
      Browse
    </Button>
  );
}
