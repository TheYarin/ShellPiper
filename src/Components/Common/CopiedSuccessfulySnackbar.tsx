import { Fade, makeStyles, Snackbar } from "@material-ui/core";
import { FileCopy as CopyIcon } from "@material-ui/icons";
import Alert from "@material-ui/lab/Alert";
import React from "react";

const useStyles = makeStyles((_theme) => ({ copyToast: {} }));

export default function CopiedSuccessfulySnackbar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cls = useStyles();

  return (
    <Snackbar open={open} autoHideDuration={1000} onClose={onClose} TransitionComponent={Fade}>
      <Alert severity="success" icon={<CopyIcon />} variant="filled" className={cls.copyToast}>
        Copied successfuly
      </Alert>
    </Snackbar>
  );
}
