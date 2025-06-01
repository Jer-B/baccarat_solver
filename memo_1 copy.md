Now update the tree with the betting interface files refactor and current hand block refactor there is any new used file from that refactor.

```
src/components/CommonAppHeader.vue  // Main app header with info panels & dev tools toggles
├── 📦 Vue 3 Core
│   ├── vue (computed)  // Vue reactivity
│   └── vue (defineProps, defineEmits)  // Vue composition API
├── 🎨 Design System Dependencies
│   ├── src/design-system/primitives/Header/
│   │   ├── Header.vue  // Headless header primitive component
│   │   └── index.ts  // Header exports and TypeScript interfaces
├── 🔘 Button Architecture (CDD/HEADLESS SYSTEM)
│   ├── src/components/common/button/BaseToggleButton.vue  // Styled wrapper component (167 lines)
│   ├── src/components/common/button/InfoPanelToggleButton.vue  // Uses BaseToggleButton (67% code reduction)
│   ├── src/components/common/button/DevToolsToggleButton.vue  // Uses BaseToggleButton (68% code reduction)
│   ├── src/components/common/button/InfoSectionToggleButton.vue  // Small info toggles (100/100 excellence)
│   └── src/components/common/button/index.ts  // Clean exports
├── 🎮 **SESSION CONTROL CDD/HEADLESS SYSTEM (100/100 PROFESSIONAL EXCELLENCE)**
│   ├── 🏗️ **HEADLESS PRIMITIVES LAYER**
│   │   ├── src/design-system/primitives/BalanceSettings/
│   │   │   ├── BalanceSettings.vue  // Headless balance primitive (280 lines) - Pure logic + slot-based API
│   │   │   └── index.ts  // TypeScript interfaces (BalanceProps, BalanceEmits, BalanceState)
│   │   ├── src/design-system/primitives/DeckSettings/
│   │   │   ├── DeckSettings.vue  // Headless deck primitive (277 lines) - Pure logic + slot-based API
│   │   │   └── index.ts  // TypeScript interfaces (DeckProps, DeckEmits, DeckState)
│   │   └── src/design-system/primitives/BurnSettings/
│   │       ├── BurnSettings.vue  // Headless burn primitive (415 lines) - Pure logic + slot-based API
│   │       └── index.ts  // TypeScript interfaces (BurnProps, BurnEmits, BurnState)
│   ├── 🎨 **STYLED WRAPPER LAYER**
│   │   ├── src/components/session/sections/BalanceSettingsSection.vue  // Styled balance wrapper (198 lines)
│   │   ├── src/components/session/sections/DeckSettingsSection.vue  // Styled deck wrapper (194 lines)
│   │   └── src/components/session/sections/BurnSettingsSection.vue  // Styled burn wrapper (225 lines)
│   ├── 🎯 **MAIN SESSION CONTROL ORCHESTRATOR**
│   │   └── src/components/session/SessionControl.vue  // Main session controller (515 lines) - CDD architecture
│   │       ├── Configuration-driven styling  // Zero hardcoded CSS classes
│   │       ├── Event-driven communication  // Perfect event emission/catching
│   │       ├── Pure composition API  // setup() pattern exclusively
│   │       ├── Real-time timer system  // Reactive session duration display
│   │       ├── Store integration  // Proper baccaratStore property access
│   │       └── **EXACT UI PRESERVATION**  // Original colors, gradients, layouts maintained
│   └── ⚙️ **CONFIGURATION LAYER**
│       └── src/config/sessionControlSettings.ts  // Comprehensive configuration (3500+ lines)
│           ├── SESSION_CONTROL  // Main controller configuration
│           ├── SESSION_CONTROL_DEFAULTS  // Default values and constants
│           ├── VALIDATION_STYLING  // Validation error/warning/success styles
│           ├── BALANCE_SETTINGS  // Balance section configuration
│           ├── DECK_SETTINGS  // Deck section configuration
│           ├── BURN_SETTINGS  // Burn section configuration
│           ├── FORM_FIELDS  // Form field configurations
│           ├── SESSION_CONTROL_EVENTS  // Event type definitions
│           └── **100% DRY COMPLIANCE**  // Zero hardcoded values across entire system
├── 🗂️ Navigation Tab System (98/100 excellence)
│   ├── src/design-system/primitives/TabMenu/
│   │   ├── TabMenu.vue  // Headless tab navigation primitive
│   │   └── index.ts  // TabMenu exports and TypeScript interfaces
│   ├── src/components/common/CommonTabMenu.vue  // Styled tab wrapper
│   └── src/router/index.ts  // Vue Router configuration
├── 🔔 **SESSION REQUIRED NOTIFICATION SYSTEM (100/100 PROFESSIONAL EXCELLENCE)**
│   ├── src/design-system/primitives/NotificationBanner/
│   │   ├── NotificationBanner.vue  // Headless notification banner primitive (426 lines)
│   │   └── index.ts  // NotificationBanner exports and TypeScript interfaces
│   ├── src/components/notifications/SessionRequiredNotification.vue  // Styled notification wrapper (192 lines)
│   ├── src/composables/useSessionNotifications.ts  // Session notification composable (312 lines)
│   └── src/config/notificationSettings.ts  // Centralized notification configuration (185 lines)
├── 📄 Pagination System (98/100 excellence - PERFECT ARCHITECTURE)
│   ├── src/design-system/primitives/Pagination/
│   │   ├── Pagination.vue  // Headless pagination primitive (244 lines)
│   │   └── index.ts  // Pagination exports and TypeScript interfaces
│   ├── src/components/common/pagination/PaginationControls.vue  // Styled pagination wrapper (324 lines)
│   ├── src/composables/usePagination.ts  // Pagination composable (269 lines)
│   └── src/components/history/SessionHistory.vue  // Pagination usage example
├── 🔗 Connection Status System (98/100 excellence)
│   ├── src/design-system/primitives/ConnectionBanner/
│   │   ├── ConnectionBanner.vue  // Headless connection banner primitive
│   │   └── index.ts  // ConnectionBanner exports
│   ├── src/components/ConnectionStatusBanner.vue  // Styled connection wrapper
│   └── src/stores/connectionStore.ts  // Connection state management (Pinia)
├── 📱 **SESSION LIFECYCLE MANAGEMENT SYSTEM (100/100 UNIVERSAL EXCELLENCE)**
│   ├── **src/composables/useSessionPersistence.ts**  // **NEW** Session persistence composable (57 lines)
│   │   ├── Universal browser compatibility  // Works across all browsers/refresh methods
│   │   ├── Ghost session cleanup  // Handles interrupted sessions automatically
│   │   ├── Setup() pattern integration  // Modern Vue 3 composition API
│   │   └── Manual lifecycle control  // No complex event interception needed
│   ├── **src/services/sessionService.ts**  // **ENHANCED** Session service with lifecycle flags (333 lines)
│   │   ├── session_lifecycle_flag support  // 1=active, 2=completed, 3=interrupted
│   │   ├── handleGhostSessions() method  // Automatic cleanup of interrupted sessions
│   │   ├── Enhanced TypeScript interfaces  // Complete type safety for lifecycle flags
│   │   └── Database operation optimization  // Efficient session state management
│   ├── **src/stores/baccaratStore.ts**  // **ENHANCED** Store with lifecycle flag integration (1707 lines)
│   │   ├── startSession() with lifecycle flags  // Flag=1 on session start
│   │   ├── endSession() with proper completion  // Flag=2 on normal session end
│   │   ├── handlePageRefresh() ghost cleanup  // Flag=3 for interrupted sessions
│   │   └── Real-time timer system  // Reactive session duration tracking
│   └── **src/App.vue**  // **SIMPLIFIED** App with universal session handling (214 lines)
│       ├── Removed complex refresh dialogs  // No browser popup interception needed
│       ├── Ghost session cleanup on mount  // Universal session state recovery
│       ├── Clean setup() pattern  // Modern Vue 3 lifecycle management
│       └── Browser-agnostic approach  // Works with any refresh method
├── ⚙️ Configuration Layer
│   ├── src/config/gameSettings.ts  // Centralized configuration
│   ├── **src/config/sessionControlSettings.ts**  // Session Control configuration (3500+ lines)
│   └── src/config/notificationSettings.ts  // Notification configuration
├── 🏪 Store Integration
│   ├── src/stores/visibilityStore.ts  // Visibility state management
│   ├── **src/stores/baccaratStore.ts**  // **ENHANCED** with session lifecycle flags
│   └── src/stores/connectionStore.ts  // Connection state management
├── 🔧 Composable Layer
│   ├── src/composables/useSessionNotifications.ts  // Session notification logic
│   ├── **src/composables/useSessionPersistence.ts**  // **NEW** Universal session persistence
│   └── src/composables/usePagination.ts  // Pagination logic
├── 🗄️ **DATABASE INTEGRATION (100/100 RELIABILITY)**
│   ├── **api.user_sessions table**  // **ENHANCED** with session_lifecycle_flag column
│   │   ├── session_lifecycle_flag INTEGER  // 1=active, 2=completed, 3=interrupted
│   │   ├── Proper indexes and constraints  // Optimized query performance
│   │   ├── Automatic ghost session detection  // Database-level session tracking
│   │   └── Migration applied successfully  // Database schema updated
│   └── **Session State Reliability**  // **100% UNIVERSAL COMPATIBILITY**
│       ├── No browser popup dependencies  // Universal approach works everywhere
│       ├── Automatic interrupted session cleanup  // Ghost sessions marked as interrupted
│       ├── Database-driven session tracking  // Reliable cross-session state management
│       └── Perfect session lifecycle accuracy  // Completed vs interrupted distinction
├── 📱 Application Views
│   ├── src/views/GameView.vue  // Main game interface with Session Control integration
│   └── src/views/HistoryView.vue  // Session history interface
└── 🧪 Developer Tools System (98/100 excellence)
    ├── src/components/testing/DeveloperToolsPanel.vue  // Headless Panel usage (70% code reduction)
    ├── src/config/developerTools.ts  // Complete configuration system
    ├── src/services/developerToolsActionStrategy.ts  // Strategy pattern implementation
    └── src/design-system/primitives/Panel/Panel.vue  // Enhanced headless Panel
```
