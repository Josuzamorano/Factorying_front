import { useTheme, useMediaQuery } from '@mui/material';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BreakpointStatus {
  // Breakpoint actual
  current: Breakpoint;
  // Helpers para verificar tamaño
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  // Helpers para rangos
  isMobile: boolean;    // xs, sm
  isTablet: boolean;    // md
  isDesktop: boolean;   // lg, xl
  // Helpers "up" y "down"
  isSmUp: boolean;
  isMdUp: boolean;
  isLgUp: boolean;
  isSmDown: boolean;
  isMdDown: boolean;
  isLgDown: boolean;
}

/**
 * Hook para detectar el breakpoint actual y proporcionar helpers útiles
 */
export function useMediaQueryBreakpoint(): BreakpointStatus {
  const theme = useTheme();

  // Detectar cada breakpoint
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  // Detectar rangos "up"
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  // Detectar rangos "down"
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'));

  // Determinar breakpoint actual
  const getCurrent = (): Breakpoint => {
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    if (isSm) return 'sm';
    return 'xs';
  };

  return {
    current: getCurrent(),
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile: isXs || isSm,
    isTablet: isMd,
    isDesktop: isLg || isXl,
    isSmUp,
    isMdUp,
    isLgUp,
    isSmDown,
    isMdDown,
    isLgDown,
  };
}

export default useMediaQueryBreakpoint;
