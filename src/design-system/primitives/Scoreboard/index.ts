// =============================================================================
// SCOREBOARD HEADLESS PRIMITIVE EXPORTS
// =============================================================================
// Professional CDD/Headless system exports
// Following established patterns from other primitives

export { default as Scoreboard } from './Scoreboard.vue';

// Export all TypeScript interfaces and types
export type { ScoreboardProps, ScoreboardEmits, ScoreboardState } from './Scoreboard.vue';

// Re-export configuration types for convenience
export type {
  ScoreboardCell,
  PatternCell,
  ScoreboardStats,
  CurrentStreak,
  ScoreboardView,
} from '@/config/scoreboardSettings';
