import * as React from 'react';
import RouterLink from '../../components/RouterLink';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';

import { paths } from '../../paths';
import { DynamicLogo } from '../../components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        p: { xs: 2, sm: 3, md: 4 },
        backgroundColor: 'var(--mui-palette-background-default)',
        backgroundImage:
          'radial-gradient(50% 50% at 50% 30%, rgba(99, 91, 255, 0.08) 0%, rgba(99, 91, 255, 0) 100%)',
      }}
    >
      <Card
        elevation={1}
        sx={{
          width: '100%',
          maxWidth: '440px',
          minHeight: '520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box',
          p: { xs: 3, sm: 4 },
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent top border line representing power quality monitoring */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #635bff 0%, #15b79f 100%)',
          }}
        />
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
            <DynamicLogo colorDark="light" colorLight="dark" height={32} width={122} />
          </Box>
          <Box sx={{ width: '100%' }}>{children}</Box>
        </Stack>
      </Card>
    </Box>
  );
}
