import { Components, Theme } from '@mui/material';

// Overrides de componentes MUI
export const getComponentOverrides = (mode: 'light' | 'dark'): Components<Theme> => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: mode === 'dark' ? '#6b6b6b #2b2b2b' : '#c1c1c1 #f1f1f1',
        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: mode === 'dark' ? '#6b6b6b' : '#c1c1c1',
          minHeight: 24,
        },
        '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
          backgroundColor: mode === 'dark' ? '#959595' : '#a8a8a8',
        },
        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
          backgroundColor: mode === 'dark' ? '#2b2b2b' : '#f1f1f1',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 500,
      },
      containedPrimary: {
        '&:hover': {
          boxShadow: '0 4px 12px rgba(30, 60, 114, 0.3)',
        },
      },
    },
    defaultProps: {
      disableElevation: false,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      },
    },
  },
  MuiCardActionArea: {
    styleOverrides: {
      root: {
        '&:hover': {
          '& .MuiCardActionArea-focusHighlight': {
            opacity: 0.04,
          },
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: 12,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small',
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiSelect: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        backgroundColor: mode === 'dark' ? '#2d2d2d' : '#fafafa',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:last-child td, &:last-child th': {
          border: 0,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
        fontSize: '0.75rem',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: 4,
      },
      rounded: {
        borderRadius: 8,
      },
    },
  },
});
