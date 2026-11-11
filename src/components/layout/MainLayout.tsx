import React, { useState } from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { AppHeader } from './AppHeader';
import { MobileDrawer } from './MobileDrawer';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showFooter?: boolean;
  disablePadding?: boolean;
}

/**
 * Layout principal de la aplicación
 * Incluye AppHeader, MobileDrawer y Footer
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'Sistema de Factoring',
  maxWidth = 'lg',
  showFooter = true,
  disablePadding = false,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Header */}
      <AppHeader title={title} onMenuClick={handleDrawerToggle} />

      {/* Drawer móvil */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {maxWidth ? (
          <Container
            maxWidth={maxWidth}
            sx={{
              flex: 1,
              py: disablePadding ? 0 : 3,
              px: disablePadding ? 0 : undefined,
            }}
          >
            {children}
          </Container>
        ) : (
          <Box
            sx={{
              flex: 1,
              p: disablePadding ? 0 : 3,
            }}
          >
            {children}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {showFooter && (
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            backgroundColor: theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : '#f5f5f5',
            textAlign: 'center',
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Sistema de Factoring © {new Date().getFullYear()} - Versión 2.0 React
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MainLayout;
