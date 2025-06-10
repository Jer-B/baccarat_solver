/**
 * 🏗️ Container Generator Types - Over Excellence Level
 *
 * Configurable container system for dynamic UI generation.
 * Supports conditional features, multiple layouts, and adaptive sizing.
 *
 * @fileoverview Container generator branded types and configuration interfaces
 * @version 1.0.0
 * @author CDD Architecture Team
 */

// ==================== BRANDED TYPES ====================

type Brand<T, TBrand> = T & { readonly __brand: TBrand };

export type ContainerId = Brand<string, 'ContainerId'>;
export type ContainerSize = Brand<string, 'ContainerSize'>;
// Renamed to avoid conflict with enum
export type ContainerPositionValue = Brand<string, 'ContainerPositionValue'>;

// ==================== CONFIGURATION ENUMS ====================

/**
 * Container types with different capabilities
 */
export enum ContainerType {
  // Basic containers
  SIMPLE = 'simple', // Just content, no extras
  BASIC_HEADER = 'basic_header', // Title only

  // Interactive containers
  COLLAPSIBLE = 'collapsible', // Title + expand/collapse
  ACTION_PANEL = 'action_panel', // Title + action buttons
  FULL_FEATURED = 'full_featured', // Title + buttons + collapsible + status

  // Specialized containers
  SESSION_CONTROL = 'session_control', // Your existing session control
  ANALYSIS_PANEL = 'analysis_panel', // For gambling analysis
  SETTINGS_PANEL = 'settings_panel', // For configuration
  STATUS_DASHBOARD = 'status_dashboard', // For monitoring
}

/**
 * Container sizes with responsive breakpoints
 */
export enum ContainerSizeType {
  COMPACT = 'compact', // Small, minimal space
  STANDARD = 'standard', // Default size
  EXPANDED = 'expanded', // Larger for detailed content
  FULL_WIDTH = 'full_width', // Takes full container width
  CUSTOM = 'custom', // Custom dimensions specified
}

/**
 * Container positioning options
 */
export enum ContainerPosition {
  STATIC = 'static', // Normal document flow
  FLOATING = 'floating', // Floating overlay
  SIDEBAR = 'sidebar', // Side panel
  MODAL = 'modal', // Modal overlay
  INLINE = 'inline', // Inline with other content
  GRID_ITEM = 'grid_item', // Part of a grid layout
}

/**
 * Title bar feature flags
 */
export enum TitleFeature {
  NONE = 'none', // No title bar
  TITLE_ONLY = 'title_only', // Just the title text
  WITH_STATUS = 'with_status', // Title + status indicator
  WITH_ACTIONS = 'with_actions', // Title + action buttons
  WITH_COLLAPSE = 'with_collapse', // Title + expand/collapse
  FULL_FEATURED = 'full_featured', // Title + status + actions + collapse
}

/**
 * Action button configurations
 */
export enum ActionButtonType {
  PRIMARY = 'primary', // Main action (Start/Stop/Save)
  SECONDARY = 'secondary', // Secondary action (Reset/Cancel)
  DANGER = 'danger', // Destructive action (Delete/Clear)
  INFO = 'info', // Informational action (Help/About)
  CUSTOM = 'custom', // Custom styled button
}

// ==================== CONFIGURATION INTERFACES ====================

/**
 * Custom dimensions for containers
 */
export interface CustomDimensions {
  readonly width?: string;
  readonly height?: string;
  readonly minWidth?: string;
  readonly minHeight?: string;
  readonly maxWidth?: string;
  readonly maxHeight?: string;
}

/**
 * Action button configuration
 */
export interface ActionButtonConfig {
  readonly id: string;
  readonly type: ActionButtonType;
  readonly label: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly tooltip?: string;
  readonly onClick: () => Promise<void> | void;
}

/**
 * Status indicator configuration
 */
export interface StatusConfig {
  readonly show: boolean;
  readonly text?: string;
  readonly color?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
  readonly pulse?: boolean;
  readonly badge?: boolean;
}

/**
 * Title bar configuration
 */
export interface TitleBarConfig {
  readonly feature: TitleFeature;
  readonly title: string;
  readonly subtitle?: string;
  readonly collapsible?: boolean;
  readonly initialExpanded?: boolean;
  readonly status?: StatusConfig;
  readonly actions?: ActionButtonConfig[];
  readonly showActionsInCollapsed?: boolean;
  readonly customContent?: boolean; // For slot content
}

/**
 * Mutable version for internal operations - fixes readonly assignment errors
 */
export interface MutableTitleBarConfig {
  feature: TitleFeature;
  title: string;
  subtitle?: string;
  collapsible?: boolean;
  initialExpanded?: boolean;
  status?: StatusConfig;
  actions?: ActionButtonConfig[];
  showActionsInCollapsed?: boolean;
  customContent?: boolean;
}

/**
 * Layout and positioning configuration
 */
export interface LayoutConfig {
  readonly position: ContainerPosition;
  readonly size: ContainerSizeType;
  readonly customDimensions?: CustomDimensions;
  readonly responsive?: boolean;
  readonly zIndex?: number;
  readonly className?: string;
}

/**
 * Mutable version for internal operations
 */
export interface MutableLayoutConfig {
  position: ContainerPosition;
  size: ContainerSizeType;
  customDimensions?: CustomDimensions;
  responsive?: boolean;
  zIndex?: number;
  className?: string;
}

/**
 * Content area configuration
 */
export interface ContentConfig {
  readonly padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readonly background?: 'transparent' | 'neutral' | 'accent' | 'custom';
  readonly scrollable?: boolean;
  readonly maxHeight?: string;
  readonly customClassName?: string;
}

/**
 * Theme and styling configuration
 */
export interface ThemeConfig {
  readonly theme: 'luxury' | 'elite' | 'minimal' | 'custom';
  readonly variant?: 'default' | 'outlined' | 'filled' | 'elevated';
  readonly colorScheme?: 'auto' | 'light' | 'dark';
  readonly borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readonly shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Mutable version for internal operations
 */
export interface MutableThemeConfig {
  theme: 'luxury' | 'elite' | 'minimal' | 'custom';
  variant?: 'default' | 'outlined' | 'filled' | 'elevated';
  colorScheme?: 'auto' | 'light' | 'dark';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Animation and interaction configuration
 */
export interface InteractionConfig {
  readonly animations?: boolean;
  readonly transitions?: boolean;
  readonly hoverEffects?: boolean;
  readonly focusVisible?: boolean;
  readonly draggable?: boolean;
  readonly resizable?: boolean;
}

/**
 * Main container configuration object
 */
export interface ContainerConfig {
  readonly id: ContainerId;
  readonly type: ContainerType;
  readonly titleBar: TitleBarConfig;
  readonly layout: LayoutConfig;
  readonly content: ContentConfig;
  readonly theme: ThemeConfig;
  readonly interaction: InteractionConfig;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Mutable version for internal factory operations
 */
export interface MutableContainerConfig {
  id: ContainerId;
  type: ContainerType;
  titleBar: MutableTitleBarConfig;
  layout: MutableLayoutConfig;
  content: ContentConfig;
  theme: MutableThemeConfig;
  interaction: InteractionConfig;
  metadata?: Record<string, unknown>;
}

// ==================== UPDATE HELPER TYPES ====================

/**
 * Safe partial update types that preserve required fields
 */
export type TitleBarUpdate = Partial<TitleBarConfig>;

export type LayoutUpdate = Partial<LayoutConfig>;

export type ThemeUpdate = Partial<ThemeConfig>;

export type ContainerConfigUpdate = Partial<ContainerConfig>;

// ==================== GRID SYSTEM INTERFACES ====================

/**
 * Grid container configuration for multiple containers
 */
export interface GridConfig {
  readonly columns: number | 'auto' | 'responsive';
  readonly gap: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readonly responsive?: {
    readonly sm?: number;
    readonly md?: number;
    readonly lg?: number;
    readonly xl?: number;
  };
  readonly autoFlow?: 'row' | 'column' | 'dense';
  readonly alignItems?: 'start' | 'center' | 'end' | 'stretch';
  readonly justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

/**
 * Container positioning within grid
 */
export interface GridItemConfig {
  readonly colSpan?: number | 'full';
  readonly rowSpan?: number | 'full';
  readonly colStart?: number;
  readonly colEnd?: number;
  readonly rowStart?: number;
  readonly rowEnd?: number;
  readonly order?: number;
}

/**
 * Multi-container layout configuration
 */
export interface MultiContainerConfig {
  readonly layoutType: 'grid' | 'flex' | 'absolute' | 'stack';
  readonly grid?: GridConfig;
  readonly containers: Array<ContainerConfig & { gridItem?: GridItemConfig }>;
  readonly spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readonly responsive?: boolean;
}

// ==================== COMPONENT INTERFACES ====================

/**
 * Container generator component props
 */
export interface ContainerGeneratorProps {
  readonly config: ContainerConfig;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly debug?: boolean;
}

/**
 * Container generator component emits
 */
export interface ContainerGeneratorEmits {
  'config-changed': [config: ContainerConfig];
  'expansion-changed': [containerId: ContainerId, isExpanded: boolean];
  'action-triggered': [containerId: ContainerId, actionId: string];
  'container-mounted': [containerId: ContainerId];
  'container-unmounted': [containerId: ContainerId];
  'error-occurred': [containerId: ContainerId, error: Error];
}

/**
 * Multi-container generator props
 */
export interface MultiContainerProps {
  readonly config: MultiContainerConfig;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly debug?: boolean;
}

// ==================== PRESET CONFIGURATIONS ====================

/**
 * Pre-built container configurations for common use cases
 */
export interface ContainerPresets {
  readonly SESSION_CONTROL: ContainerConfig;
  readonly SIMPLE_PANEL: ContainerConfig;
  readonly SETTINGS_PANEL: ContainerConfig;
  readonly ANALYSIS_DASHBOARD: ContainerConfig;
  readonly STATUS_MONITOR: ContainerConfig;
  readonly COLLAPSIBLE_FORM: ContainerConfig;
  readonly ACTION_CENTER: ContainerConfig;
  readonly INFO_DISPLAY: ContainerConfig;
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Create container ID
 */
export const createContainerId = (prefix: string = 'container'): ContainerId => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}` as ContainerId;
};

/**
 * Create basic container configuration
 */
export const createBasicContainerConfig = (
  title: string,
  type: ContainerType = ContainerType.BASIC_HEADER
): ContainerConfig => {
  const mutableConfig: MutableContainerConfig = {
    id: createContainerId(),
    type,
    titleBar: {
      feature: TitleFeature.TITLE_ONLY,
      title,
      collapsible: false,
      initialExpanded: true,
    },
    layout: {
      position: ContainerPosition.STATIC,
      size: ContainerSizeType.STANDARD,
      responsive: true,
    },
    content: {
      padding: 'md',
      background: 'neutral',
      scrollable: false,
    },
    theme: {
      theme: 'luxury',
      variant: 'default',
      colorScheme: 'auto',
      borderRadius: 'lg',
      shadow: 'md',
    },
    interaction: {
      animations: true,
      transitions: true,
      hoverEffects: true,
      focusVisible: true,
      draggable: false,
      resizable: false,
    },
  };

  // Convert to readonly version
  return mutableConfig as ContainerConfig;
};

/**
 * Create session control configuration (matches your existing component)
 */
export const createSessionControlConfig = (): ContainerConfig => {
  const mutableConfig: MutableContainerConfig = {
    id: createContainerId('session'),
    type: ContainerType.SESSION_CONTROL,
    titleBar: {
      feature: TitleFeature.FULL_FEATURED,
      title: 'Session Control',
      collapsible: true,
      initialExpanded: true,
      status: {
        show: true,
        color: 'neutral',
        badge: true,
      },
      actions: [
        {
          id: 'primary-action',
          type: ActionButtonType.PRIMARY,
          label: 'Start Session',
          onClick: async () => {
            console.log('Session action triggered');
          },
        },
      ],
      showActionsInCollapsed: true,
    },
    layout: {
      position: ContainerPosition.STATIC,
      size: ContainerSizeType.STANDARD,
      responsive: true,
    },
    content: {
      padding: 'lg',
      background: 'accent',
      scrollable: false,
    },
    theme: {
      theme: 'luxury',
      variant: 'elevated',
      colorScheme: 'auto',
      borderRadius: 'lg',
      shadow: 'lg',
    },
    interaction: {
      animations: true,
      transitions: true,
      hoverEffects: true,
      focusVisible: true,
      draggable: false,
      resizable: false,
    },
  };

  // Convert to readonly version
  return mutableConfig as ContainerConfig;
};

// ==================== EXPORTS ====================
// All types are already exported inline above with individual export declarations
