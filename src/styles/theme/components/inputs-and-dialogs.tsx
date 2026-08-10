import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiInputBase = {
  styleOverrides: {
    root: {
      fontSize: '0.875rem',
    },
  },
} satisfies Components<Theme>['MuiInputBase'];

export const MuiOutlinedInput = {
  styleOverrides: {
    root: {
      borderRadius: '6px',
    },
  },
} satisfies Components<Theme>['MuiOutlinedInput'];

export const MuiInputLabel = {
  styleOverrides: {
    root: {
      fontSize: '0.875rem',
    },
  },
} satisfies Components<Theme>['MuiInputLabel'];

export const MuiChip = {
  styleOverrides: {
    root: {
      height: '22px',
      fontSize: '0.6875rem',
      borderRadius: '4px',
    },
    sizeSmall: {
      height: '18px',
      fontSize: '0.625rem',
    },
  },
} satisfies Components<Theme>['MuiChip'];

export const MuiDialog = {
  styleOverrides: {
    paper: {
      borderRadius: '10px',
      padding: '12px',
    },
  },
} satisfies Components<Theme>['MuiDialog'];

export const MuiDialogTitle = {
  styleOverrides: {
    root: {
      padding: '12px 16px 8px',
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
} satisfies Components<Theme>['MuiDialogTitle'];

export const MuiDialogContent = {
  styleOverrides: {
    root: {
      padding: '12px 16px',
    },
  },
} satisfies Components<Theme>['MuiDialogContent'];

export const MuiDialogActions = {
  styleOverrides: {
    root: {
      padding: '8px 16px 12px',
      gap: '8px',
    },
  },
} satisfies Components<Theme>['MuiDialogActions'];
