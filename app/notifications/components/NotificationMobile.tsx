import { NotificationList } from './NotificationList';
import type { NotificationRecord } from '../types';

export function NotificationMobile({ notifications }: { notifications: NotificationRecord[] }) {
  return (
    <div className="notification-mobile">
      <NotificationList notifications={notifications} />
    </div>
  );
}
