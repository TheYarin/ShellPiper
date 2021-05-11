import { lighten, Theme } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

export function spaceChildren(
  spaceSize: string | number,
  direction: 'vertically' | 'horizontally' = 'horizontally'
): CSSProperties {
  let relevantMargin;
  switch (direction) {
    case 'vertically':
      relevantMargin = 'marginBottom';
      break;
    case 'horizontally':
      relevantMargin = 'marginRight';
      break;
  }

  return notLastChild({
    [relevantMargin]: spaceSize,
  });
}

export const flexCol: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};
export const flexColCentered: CSSProperties = {
  ...flexCol,
  alignItems: 'center',
};

export function notLastChild(attributes: CSSProperties = {}): CSSProperties {
  return { '& > *:not(:last-child)': attributes };
}

export function directChildren(attributes: CSSProperties = {}): CSSProperties {
  return { '& >': attributes };
}

export function lowProfileButtonColors(
  theme: Theme,
  lightenCoefficient: number = 0
) {
  return {
    color: lighten(theme.constants.lowProfileButtonColor, lightenCoefficient),
    '&:hover': {
      color: lighten(
        theme.constants.lowProfileButtonHoverColor,
        lightenCoefficient
      ),
    },
  };
}
