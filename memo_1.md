PLEASE KEEP THE CURRENT UI ! STOP BREAKING UI !! KEEP ACTUAL BUTTONS COLORS WHEN CLICKED OR NOT PATTERN, background colors, design, texts etc... every design as it is originally !!!!!!!!!! just adapt to a headless design / cdd component pattern

dont answer before deep search, deep analyze, deep thinking, deep analyze of what you are going to answer, and deap reanalyze. etc...

ok by looking at the tree now.

Does the current hand block require more refactoring ? CDD, Headless Component / Design pattern etc... ? Is it extracted from any mixed logics ?

Is it purely compositionnal ?

Does whole logic and design is DRY ?

How to be 100% efficace and make a best professional refactor of that section while keeping in mind our rules and project structure while following best how tos and be impeccable in for a modular implementation ?

During refactor can you make sure that payout calculation on loss and win are calculated from the freshly refactored payout settings ?

During refactor can you make sure that the betting interface balance is updated depending on the payout result ?

does events that should be emitted are emitted and well catched ?
does it use setup() pattern instead of onmounted pattern ?

Should it have its default settings to be extracted into a setting file ?

Don't do backward compatibility thing ! If something become obsolete remove it. dont remove the file on your own I will do it. You just need to tell me what file is not used anymore.

PLEASE KEEP THE CURRENT UI ! STOP BREAKING UI !! KEEP ACTUAL BUTTONS COLORS WHEN CLICKED OR NOT PATTERN, background colors, design, etc... every design as it is originally !!!!!!!!!! just adapt to a headless design / cdd component pattern

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
│   │   ├── src/design-system/primitives/BurnSettings/
│   │   │   ├── BurnSettings.vue  // Headless burn primitive (415 lines) - Pure logic + slot-based API
│   │   │   └── index.ts  // TypeScript interfaces (BurnProps, BurnEmits, BurnState)
│   │   └── 💰 **src/design-system/primitives/PayoutSettings/**  // **NEW CDD PAYOUT SYSTEM**
│   │       ├── PayoutSettings.vue  // **NEW** Headless payout primitive (478 lines) - Pure logic + slot-based API
│   │       └── index.ts  // **NEW** TypeScript interfaces (PayoutProps, PayoutEmits, PayoutState, PayoutSlotProps)
│   ├── 🎨 **STYLED WRAPPER LAYER**
│   │   ├── src/components/session/sections/BalanceSettingsSection.vue  // Styled balance wrapper (198 lines)
│   │   ├── src/components/session/sections/DeckSettingsSection.vue  // Styled deck wrapper (194 lines)
│   │   ├── src/components/session/sections/BurnSettingsSection.vue  // Styled burn wrapper (225 lines)
│   │   └── 💰 **src/components/session/sections/PayoutSettingsSection.vue**  // **NEW** Styled payout wrapper (851 lines)
│   │       ├── **EXACT UI PRESERVATION**  // Original colors, gradients, layouts maintained
│   │       ├── **Professional info panels**  // Styled like burn card information
│   │       ├── **Manual editing integration**  // Automatic preset clearing on manual edits
│   │       ├── **Custom preset management**  // Save/delete/set default functionality
│   │       ├── **Betting interface handlers**  // Ready for betting decisions integration
│   │       ├── **Statistics formatPercentage**  // Professional-grade percentage display
│   │       └── **Algorithm integration points**  // Kelly Criterion, edge calculations ready
│   ├── 🎯 **MAIN SESSION CONTROL ORCHESTRATOR**
│   │   └── src/components/session/SessionControl.vue  // **ENHANCED** Main session controller (515+ lines)
│   │       ├── **PayoutSettingsSection integration**  // Full payout settings support
│   │       ├── **Payout state management**  // currentPayoutValues, selectedPayoutPresetId
│   │       ├── **Payout event handlers**  // handlePayoutChange, handlePayoutPresetSelected, etc.
│   │       ├── **Session settings extension**  // payoutValues and selectedPayoutPresetId in SessionSettings
│   │       ├── Configuration-driven styling  // Zero hardcoded CSS classes
│   │       ├── Event-driven communication  // Perfect event emission/catching
│   │       ├── Pure composition API  // setup() pattern exclusively
│   │       ├── Real-time timer system  // Reactive session duration display
│   │       ├── Store integration  // Proper baccaratStore property access
│   │       └── **EXACT UI PRESERVATION**  // Original colors, gradients, layouts maintained
│   ├── 📤 **SECTION EXPORTS**
│   │   └── src/components/session/sections/index.ts  // **ENHANCED** Clean section exports + PayoutSettingsSection
│   └── ⚙️ **CONFIGURATION LAYER**
│       ├── src/config/sessionControlSettings.ts  // Comprehensive configuration (3500+ lines)
│       │   ├── SESSION_CONTROL  // Main controller configuration
│       │   ├── SESSION_CONTROL_DEFAULTS  // Default values and constants
│       │   ├── VALIDATION_STYLING  // Validation error/warning/success styles
│       │   ├── BALANCE_SETTINGS  // Balance section configuration
│       │   ├── DECK_SETTINGS  // Deck section configuration
│       │   ├── BURN_SETTINGS  // Burn section configuration
│       │   ├── FORM_FIELDS  // Form field configurations
│       │   ├── SESSION_CONTROL_EVENTS  // Event type definitions
│       │   └── **100% DRY COMPLIANCE**  // Zero hardcoded values across entire system
│       └── 💰 **src/config/payoutSettings.ts**  // **NEW** Comprehensive payout configuration (449 lines)
│           ├── PAYOUT_SETTINGS_DEFAULTS  // Default values, constraints, limits
│           ├── PAYOUT_SETTINGS  // Styling, labels, icons, colors
│           ├── PAYOUT_FORM_FIELDS  // Form field configurations with validation
│           ├── PayoutValues interface  // TypeScript payout structure
│           ├── PayoutChangeEvent interface  // Event handling types
│           ├── ValidationError interface  // Validation error structure
│           └── PAYOUT_UTILS  // Utility functions (calculateTotalPayout, validatePayoutValues, formatCurrency, etc.)
├── 🏪 **PAYOUT PRESET DATABASE INTEGRATION (100/100 PROFESSIONAL EXCELLENCE)**
│   ├── 💾 **src/services/payoutPresetService.ts**  // **NEW** Comprehensive preset service (235 lines)
│   │   ├── **Full CRUD operations**  // getAllPresets, createPreset, updatePreset, deletePreset
│   │   ├── **Default preset management**  // getDefaultPreset, setDefaultPreset
│   │   ├── **System vs custom presets**  // Proper handling of system (Vegas/Macau) vs user presets
│   │   ├── **Comprehensive error handling**  // Structured logging throughout
│   │   ├── **TypeScript interfaces**  // PayoutPreset, CreatePayoutPresetData, UpdatePayoutPresetData
│   │   └── **Professional validation**  // Input validation and business rule enforcement
│   └── 🗄️ **Database Schema** (payout_presets table)
│       ├── **Comprehensive table structure**  // id, name, payout ratios, commission, flags, timestamps
│       ├── **System preset seeding**  // "Standard/Vegas Style" (5%), "Macau Style" (2.5%)
│       ├── **Row Level Security (RLS)**  // User isolation policies
│       ├── **Single default enforcement**  // Trigger ensures only one default per user
│       ├── **Proper indexes**  // Performance optimization
│       └── **Data constraints**  // CHECK constraints for data integrity
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
│   ├── **src/config/payoutSettings.ts**  // **NEW** Payout configuration (449 lines)
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
│   ├── 💰 **api.payout_presets table**  // **NEW** Payout preset management
│   │   ├── **Comprehensive schema**  // id, user_id, name, payout ratios, commission, flags
│   │   ├── **System preset support**  // is_system_preset, is_default flags
│   │   ├── **Row Level Security**  // User isolation policies
│   │   ├── **Single default trigger**  // Ensures only one default per user
│   │   ├── **Proper constraints**  // CHECK constraints, indexes, foreign keys
│   │   └── **Seeded data**  // Standard/Vegas (5%) and Macau (2.5%) presets
│   └── **Session State Reliability**  // **100% UNIVERSAL COMPATIBILITY**
│       ├── No browser popup dependencies  // Universal approach works everywhere
│       ├── Automatic interrupted session cleanup  // Ghost sessions marked as interrupted
│       ├── Database-driven session tracking  // Reliable cross-session state management
│       └── Perfect session lifecycle accuracy  // Completed vs interrupted distinction
├── 📱 Application Views
│   ├── src/views/GameView.vue  // **ENHANCED** Main game interface with full Session Control + Payout integration
│   └── src/views/HistoryView.vue  // Session history interface
└── 🧪 Developer Tools System (98/100 excellence)
    ├── src/components/testing/DeveloperToolsPanel.vue  // Headless Panel usage (70% code reduction)
    ├── src/config/developerTools.ts  // Complete configuration system
    ├── src/services/developerToolsActionStrategy.ts  // Strategy pattern implementation
    └── src/design-system/primitives/Panel/Panel.vue  // Enhanced headless Panel
```
