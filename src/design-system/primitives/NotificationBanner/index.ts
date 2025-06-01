export { default as NotificationBanner } from './NotificationBanner.vue';

// Define types locally
export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'session';

export interface NotificationBannerProps {
  as?: string;
  class?: string;
  role?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
  ariaLabel?: string;
  type: NotificationType;
  title: string;
  message?: string;
  isVisible?: boolean;
  isDismissible?: boolean;
  hasAction?: boolean;
  actionLabel?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export interface NotificationBannerEmits {
  dismiss: [type: NotificationType, title: string];
  action: [type: NotificationType, title: string, actionLabel: string];
  show: [type: NotificationType, title: string];
  hide: [type: NotificationType, title: string];
}

export interface NotificationBannerSlotProps {
  type: NotificationType;
  message: string;
  title: string;
  isVisible: boolean;
  isDismissible: boolean;
  hasAction: boolean;
  actionLabel: string;
  onDismiss: () => void;
  onAction: () => void;
  typeClasses: {
    banner: string;
    text: string;
    title: string;
    message: string;
    action: string;
    dismiss: string;
  };
  iconClasses: string;
  textClasses: string;
  iconPath: string;
  iconViewBox: string;
}
