import { NotificationCard } from './NotificationCard';
import type { NotificationRecord } from '../types';

export function NotificationList({ notifications }: { notifications: NotificationRecord[] }) {
  if (!notifications.length) {
    return <p className="empty-state">No notifications match your filters.</p>;
  }
  return (
    <section className="notification-list" aria-label="Your notifications">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </section>
  );
}
