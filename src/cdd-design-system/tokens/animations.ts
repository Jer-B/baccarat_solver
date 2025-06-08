export const transitions = {
  // Duration
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
  // Sophisticated toggle timing
  toggle: '500ms',
} as const;

export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Sophisticated toggle interpolation
  sophisticatedSlide: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

// Common transition combinations
export const transitionSets = {
  button: `all ${transitions.fast} ${easings.easeInOut}`,
  card: `all ${transitions.normal} ${easings.easeOut}`,
  modal: `all ${transitions.normal} ${easings.easeInOut}`,
  hover: `all ${transitions.fast} ${easings.easeOut}`,
  focus: `all ${transitions.fast} ${easings.easeInOut}`,
  // Sophisticated toggle transition
  toggleSlide: `all ${transitions.toggle} ${easings.sophisticatedSlide}`,
} as const;

export type Transition = keyof typeof transitions;
export type Easing = keyof typeof easings;
export type TransitionSet = keyof typeof transitionSets;
