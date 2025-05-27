# Advanced Baccarat Assistant - Professional Architecture

## Overview

The Advanced Baccarat Assistant is built using professional-grade architecture patterns and modern web technologies to provide sophisticated gambling analysis tools. This document outlines the comprehensive architecture decisions and standards implemented.

## Tech Stack

### Core Technologies
- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite with optimized chunking
- **State Management**: Pinia with TypeScript
- **Database**: Supabase (PostgreSQL + Real-time)
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Chart.js + Vue-ChartJS
- **Utilities**: VueUse for enhanced reactivity
- **Code Quality**: ESLint + Prettier + Husky + lint-staged

### Development Tools
- **IDE**: Cursor with custom rules
- **Version Control**: Git with conventional commits
- **Testing**: Vitest (planned)
- **CI/CD**: GitHub Actions (planned)

## Architecture Patterns

### 1. Component-Driven Development (CDD)

Following Atomic Design principles:

```
Atoms (Basic UI elements)
├── Button, Input, Badge, Icon
├── Card, Modal, Tooltip
└── Loading, Error states

Molecules (Simple combinations)
├── FormField (Label + Input + Error)
├── MetricCard (Value + Label + Description)
└── StatusIndicator (Dot + Text)

Organisms (Complex components)
├── AnalyticsPanel
├── BurnCardEstimator
└── ProfessionalRecommendations

Templates (Page layouts)
├── DashboardLayout
├── AnalysisLayout
└── SettingsLayout

Pages (Complete views)
├── Dashboard
├── Analysis
└── Settings
```

### 2. Feature-Based Architecture

```
src/
├── features/
│   ├── burn-analysis/          # Professional burn card analysis
│   │   ├── components/         # Feature-specific components
│   │   ├── composables/        # Business logic hooks
│   │   ├── services/           # API & external services
│   │   ├── stores/             # Feature state management
│   │   └── types/              # TypeScript definitions
│   ├── kelly-criterion/        # Kelly Criterion optimization
│   ├── monte-carlo/           # Monte Carlo simulations
│   ├── edge-calculations/     # Edge sorting & calculations
│   └── dealer-tells/          # Dealer tell analysis
├── shared/
│   ├── components/            # Reusable UI components
│   ├── composables/          # Shared business logic
│   ├── services/             # Common services
│   ├── stores/               # Global state
│   ├── types/                # Shared types
│   └── utils/                # Pure utility functions
└── assets/                   # Static assets
```

### 3. Clean Architecture Layers

```
┌─────────────────────────────────────┐
│           Presentation              │
│     (Vue Components, Stores)        │
├─────────────────────────────────────┤
│           Application               │
│    (Use Cases, Services, Workflows) │
├─────────────────────────────────────┤
│             Domain                  │
│  (Business Logic, Entities, Rules)  │
├─────────────────────────────────────┤
│          Infrastructure             │
│   (Supabase, APIs, External Deps)   │
└─────────────────────────────────────┘
```

## Professional Gambling Domain

### Mathematical Standards
- **Precision**: Use precise decimal arithmetic for all financial calculations
- **Confidence Intervals**: Include statistical confidence in all estimates
- **Uncertainty Quantification**: Provide error bounds and confidence levels
- **Academic References**: Document algorithms with proper citations

### Risk Management
- **Kelly Criterion**: Implement with fractional safety factors
- **Monte Carlo**: Use for risk assessment and scenario analysis
- **Bankroll Management**: Include proper position sizing
- **Disclaimers**: Clear warnings about gambling risks

### Professional Methodologies
- **Jacobson Method**: Advanced burn card analysis
- **Griffin Method**: Card counting integration
- **Wong Method**: Optimal betting strategies

## Code Quality Standards

### TypeScript Excellence
```typescript
// ✅ Good - Branded types for domain safety
type Probability = number & { readonly __brand: 'Probability' };
type EdgePercentage = number & { readonly __brand: 'EdgePercentage' };

// ✅ Good - Result pattern for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// ✅ Good - Strict interface design
interface BurnCardEstimate {
  readonly rank: Rank;
  readonly suit: Suit;
  readonly probability: Probability;
  readonly confidence: Confidence;
  readonly method: 'jacobson' | 'griffin' | 'wong';
  readonly evidence: readonly string[];
}
```

### Vue 3 Best Practices
```vue
<script setup lang="ts">
// 1. Type-only imports
import type { ComponentProps } from './types';

// 2. Vue imports
import { ref, computed, watch, onMounted } from 'vue';

// 3. External libraries
import { useBaccaratStore } from '@/stores/baccaratStore';

// 4. Props with TypeScript
interface Props {
  readonly modelValue: string;
  readonly disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// 5. Emits with TypeScript
interface Emits {
  'update:modelValue': [value: string];
  'analysis-complete': [result: AnalysisResult];
}

const emit = defineEmits<Emits>();
</script>
```

### Performance Optimization
- **Lazy Loading**: Dynamic imports for heavy components
- **Code Splitting**: Vite chunking strategy
- **Memoization**: Computed properties for expensive calculations
- **VueUse**: Enhanced reactivity patterns

## Design System

### Color Palette
```css
/* Professional Gambling Theme */
:root {
  /* Primary - Purple/Indigo */
  --color-primary-500: #8b5cf6;
  --color-primary-600: #7c3aed;
  
  /* Success - Green */
  --color-success-500: #22c55e;
  
  /* Danger - Red */
  --color-danger-500: #ef4444;
  
  /* Warning - Orange */
  --color-warning-500: #f97316;
  
  /* Premium - Gold */
  --color-premium-500: #f59e0b;
}
```

### Component System
- **Cards**: Professional gradient backgrounds
- **Buttons**: Comprehensive variant system
- **Forms**: Accessible with proper validation
- **Metrics**: Clear value presentation
- **Status**: Intuitive indicator system

## State Management (Pinia)

### Store Architecture
```typescript
export const useBaccaratStore = defineStore('baccarat', () => {
  // 1. State (reactive data)
  const gameState = ref<GameState>({...});
  
  // 2. Getters (computed properties)
  const remainingCards = computed(() => gameState.value.currentShoe.length);
  
  // 3. Actions (methods)
  const dealCard = (position: 'player' | 'banker'): Card | null => {...};
  
  // 4. Return public API
  return {
    gameState: readonly(gameState),
    remainingCards,
    dealCard,
  };
});
```

### Store Composition
- **Feature Stores**: Domain-specific state management
- **Cross-Store Communication**: Integration patterns
- **Error Handling**: Robust error state management
- **Persistence**: Local storage integration

## Database Architecture (Supabase)

### Schema Design
```sql
-- Game Sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_name TEXT NOT NULL,
  bankroll_start DECIMAL(10,2) NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('conservative', 'moderate', 'aggressive')),
  analysis_method TEXT CHECK (analysis_method IN ('jacobson', 'griffin', 'wong')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Real-time Features
- **Session Updates**: Live session synchronization
- **Multi-User Support**: Shared analysis sessions
- **Presence Tracking**: User activity monitoring

## Cursor IDE Rules

### Rule Structure
```
.cursor/rules/
├── architecture.mdc        # Main architecture standards
├── vue-typescript.mdc      # Vue 3 + TypeScript patterns
├── tailwind-styling.mdc    # Design system & styling
├── pinia-stores.mdc        # State management patterns
└── supabase-integration.mdc # Database integration
```

### Rule Types
- **Always**: Core architecture standards
- **Auto Attached**: Context-specific rules
- **Agent Requested**: AI-accessible guidance
- **Manual**: Explicit rule invocation

## Development Workflow

### Code Quality Pipeline
1. **Pre-commit**: Husky + lint-staged
2. **Linting**: ESLint with TypeScript rules
3. **Formatting**: Prettier with consistent style
4. **Type Checking**: Vue-tsc for compile-time safety

### Naming Conventions
- **Files**: PascalCase for components, camelCase for composables
- **Directories**: kebab-case (e.g., `burn-analysis/`)
- **Variables**: camelCase with descriptive names
- **Constants**: SCREAMING_SNAKE_CASE
- **Types**: PascalCase interfaces and types

## Security & Ethics

### Responsible Development
- **Educational Purpose**: No actual gambling functionality
- **Risk Warnings**: Clear disclaimers about gambling risks
- **Data Privacy**: GDPR compliance considerations
- **Ethical AI**: Responsible use of analysis tools

### Security Measures
- **Row Level Security**: Supabase RLS policies
- **Input Validation**: Zod schema validation
- **Error Handling**: Graceful failure modes
- **Authentication**: Secure user management

## Performance Considerations

### Optimization Strategies
- **Bundle Splitting**: Feature-based code splitting
- **Lazy Loading**: Component-level lazy loading
- **Caching**: Expensive calculation memoization
- **Real-time**: Efficient WebSocket usage

### Monitoring
- **Performance Metrics**: Web Vitals tracking
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage pattern analysis

## Future Enhancements

### Planned Features
- **Testing Suite**: Vitest + Vue Testing Library
- **CI/CD Pipeline**: GitHub Actions automation
- **Documentation**: Storybook component library
- **Mobile App**: React Native or Capacitor

### Scalability Considerations
- **Microservices**: Feature-based service splitting
- **CDN**: Asset delivery optimization
- **Caching**: Redis for session data
- **Load Balancing**: Multi-region deployment

---

This architecture provides a solid foundation for building a professional-grade gambling analysis application while maintaining high code quality, performance, and ethical standards. 