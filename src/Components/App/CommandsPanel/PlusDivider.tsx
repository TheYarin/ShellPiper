import { makeStyles, Divider, Button, ButtonProps } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  divider: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    backgroundColor: '#444',
  },
  root: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    margin: '6px 0',
  },
  button: {
    padding: 0,
    borderRadius: 12,
    minWidth: 0,
    width: 24,
    height: 24,
  },
  buttonContained: {
    '&$disabled': { backgroundColor: theme.palette.grey.A100 },
  },
  disabled: {},
}));

const PlusDivider = ({ ...rest }: ButtonProps) => {
  const cls = useStyles();

  return (
    <div className={cls.root}>
      <Divider className={cls.divider} variant="middle" />
      <Button
        classes={{
          contained: cls.buttonContained,
          disabled: cls.disabled,
        }}
        className={cls.button}
        variant="contained"
        {...rest}
      >
        <AddIcon />
      </Button>
    </div>
  );
};

export default PlusDivider;
