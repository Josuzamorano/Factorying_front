// Duraciones de transición estándar (en ms)
export const durations = {
  shortest: 150,
  shorter: 200,
  short: 250,
  standard: 300,
  complex: 375,
  enteringScreen: 225,
  leavingScreen: 195,
} as const;

// Funciones de easing estándar
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

// Transiciones predefinidas para usar en sx props
export const transitions = {
  // Transiciones de hover para cards
  cardHover: {
    transition: `transform ${durations.short}ms ${easings.easeInOut}, box-shadow ${durations.short}ms ${easings.easeInOut}`,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    },
  },
  // Transición suave de opacidad
  fadeIn: {
    animation: `fadeIn ${durations.standard}ms ${easings.easeOut}`,
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
  // Transición de slide desde abajo
  slideUp: {
    animation: `slideUp ${durations.standard}ms ${easings.easeOut}`,
    '@keyframes slideUp': {
      from: {
        opacity: 0,
        transform: 'translateY(20px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
  },
  // Transición de escala
  scaleIn: {
    animation: `scaleIn ${durations.short}ms ${easings.easeOut}`,
    '@keyframes scaleIn': {
      from: {
        opacity: 0,
        transform: 'scale(0.95)',
      },
      to: {
        opacity: 1,
        transform: 'scale(1)',
      },
    },
  },
  // Pulse para elementos que requieren atención
  pulse: {
    animation: `pulse 2s ${easings.easeInOut} infinite`,
    '@keyframes pulse': {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.6 },
      '100%': { opacity: 1 },
    },
  },
} as const;

// Helper para crear transiciones personalizadas
export const createTransition = (
  properties: string | string[],
  duration: keyof typeof durations = 'standard',
  easing: keyof typeof easings = 'easeInOut'
): string => {
  const props = Array.isArray(properties) ? properties : [properties];
  return props
    .map(prop => `${prop} ${durations[duration]}ms ${easings[easing]}`)
    .join(', ');
};
