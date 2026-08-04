import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiCardContent = {
  styleOverrides: { root: { padding: '16px 16px', '&:last-child': { paddingBottom: '16px' } } },
} satisfies Components<Theme>['MuiCardContent'];
