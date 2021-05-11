// Shamelessly stolen from Material UI's demo

import {
  CircularProgress as MuiCircularProgress,
  CircularProgressProps,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';
import React from 'react';

// Inspired by the former Facebook spinners.
const useStylesFacebook = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      paddingTop: 4, // To compensate for the div ending up with an extra 4 pixels in the bottom for some reason
    },
    bottom: {
      color: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    top: {
      color: '#1a90ff',
      animationDuration: '550ms',
      position: 'absolute',
      left: 0,
    },
    circle: {
      strokeLinecap: 'round',
    },
  })
);

export default function CircularProgress(props: CircularProgressProps) {
  const classes = useStylesFacebook();

  return (
    <div className={classes.root}>
      <MuiCircularProgress
        variant="determinate"
        className={classes.bottom}
        size={40}
        thickness={4}
        {...props}
        value={100}
      />
      <MuiCircularProgress
        variant="indeterminate"
        disableShrink
        className={classes.top}
        classes={{
          circle: classes.circle,
        }}
        size={40}
        thickness={4}
        {...props}
      />
    </div>
  );
}
