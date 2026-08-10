import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiTableCell = {
  styleOverrides: {
    root: {
      borderBottom: 'var(--TableCell-borderWidth, 1px) solid var(--mui-palette-TableCell-border)',
      padding: '6px 12px',
      fontSize: '0.75rem',
    },
    head: {
      padding: '8px 12px',
      fontSize: '0.75rem',
      fontWeight: 600,
    },
    paddingCheckbox: { padding: '0 0 0 12px' },
  },
} satisfies Components<Theme>['MuiTableCell'];
