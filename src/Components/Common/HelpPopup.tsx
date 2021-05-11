import { Dialog, DialogContent, DialogTitle, IconButton, lighten, makeStyles, Typography } from "@material-ui/core";
import { Close, HelpOutline } from "@material-ui/icons";
import React, { useState } from "react";

const useStyles = makeStyles((theme) => ({
  dialogPanel: { padding: 10 },
  helpButton: {
    color: lighten(theme.constants.lowProfileButtonColor, 0.7),
    "&:hover": {
      color: theme.palette.primary.light,
    },
    padding: 0,
  },
  closeButton: {
    float: "right",
    padding: 4,
  },
  dialogTitle: {
    padding: "4px 24px",
  },
  dialogContent: {
    // padding: '8px 7px',
  },
}));

export default function HelpPopup({ title, text }: { title: string; text: string }) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [open, setOpen] = useState(false);

  const cls = useStyles();

  return (
    <>
      <IconButton className={cls.helpButton} onClick={() => setOpen(true)}>
        <HelpOutline />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className={cls.dialogPanel}>
          <IconButton className={cls.closeButton} onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
          <DialogTitle className={cls.dialogTitle}>{title}</DialogTitle>
          <DialogContent className={cls.dialogContent}>
            <Typography>{text}</Typography>
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
}
