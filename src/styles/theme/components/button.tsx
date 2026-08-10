import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiButton = {
  styleOverrides: {
    root: { borderRadius: '6px', textTransform: 'none', minHeight: '32px' },
    sizeSmall: { padding: '4px 12px', fontSize: '0.75rem', minHeight: '28px' },
    sizeMedium: { padding: '6px 14px', fontSize: '0.8125rem', minHeight: '32px' },
    sizeLarge: { padding: '8px 18px', fontSize: '0.875rem', minHeight: '36px' },
    textSizeSmall: { padding: '4px 8px' },
    textSizeMedium: { padding: '6px 12px' },
    textSizeLarge: { padding: '8px 14px' },
  },
} satisfies Components<Theme>['MuiButton'];
