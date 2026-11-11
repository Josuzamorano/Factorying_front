import React from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Backdrop,
  Typography,
  useTheme,
} from '@mui/material';

/**
 * Skeleton para una tabla con filas
 */
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 5,
  showHeader = true,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableCell key={i}>
                  <Skeleton variant="text" width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" width={colIndex === 0 ? '60%' : '80%'} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Skeleton para cards de resumen (típicamente 3-4 cards en fila)
 */
interface SkeletonSummaryCardsProps {
  count?: number;
}

export const SkeletonSummaryCards: React.FC<SkeletonSummaryCardsProps> = ({
  count = 3,
}) => {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 12 / count }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="60%" height={32} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Skeleton para un formulario
 */
interface SkeletonFormProps {
  fields?: number;
  columns?: 1 | 2 | 3;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 6,
  columns = 2,
}) => {
  const gridSize = 12 / columns;

  return (
    <Grid container spacing={2}>
      {Array.from({ length: fields }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, md: gridSize }}>
          <Skeleton variant="text" width="30%" height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="rounded" height={40} />
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Skeleton para cards de menú/módulos
 */
interface SkeletonMenuCardsProps {
  count?: number;
}

export const SkeletonMenuCards: React.FC<SkeletonMenuCardsProps> = ({
  count = 12,
}) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Card>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
              }}
            >
              <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="80%" height={20} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Skeleton para página de detalle
 */
export const SkeletonDetail: React.FC = () => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="text" width="20%" height={20} />
        </Box>
        <Skeleton variant="rounded" width={100} height={36} />
      </Box>

      {/* Summary cards */}
      <SkeletonSummaryCards count={3} />

      {/* Content */}
      <Box sx={{ mt: 3 }}>
        <SkeletonForm fields={6} columns={2} />
      </Box>
    </Box>
  );
};

/**
 * Skeleton para página de listado
 */
export const SkeletonList: React.FC = () => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        <Skeleton variant="rounded" width={120} height={36} />
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={40} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={40} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={40} />
          </Grid>
        </Grid>
      </Paper>

      {/* Summary cards */}
      <Box sx={{ mb: 2 }}>
        <SkeletonSummaryCards count={3} />
      </Box>

      {/* Table */}
      <SkeletonTable rows={8} columns={6} />
    </Box>
  );
};

/**
 * Overlay de carga con spinner
 */
interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Cargando...',
}) => {
  const theme = useTheme();

  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        zIndex: theme.zIndex.drawer + 1,
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress color="inherit" size={48} />
      <Typography variant="body1">{message}</Typography>
    </Backdrop>
  );
};

/**
 * Indicador de carga inline
 */
interface InlineLoaderProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  size = 'medium',
  message,
}) => {
  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress size={sizeMap[size]} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Estado vacío
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      {icon && (
        <Box sx={{ color: 'text.secondary', mb: 2, fontSize: 64 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
};
