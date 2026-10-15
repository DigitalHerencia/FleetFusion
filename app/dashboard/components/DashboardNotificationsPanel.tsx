'use client';

import { useState } from 'react';

import { acknowledgeSystemMessage, markAlertSeen } from '../lib/dashboardActions';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

export function DashboardNotificationsPanel({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const [items, setItems] = useState(notifications);
  async function markRead(id: string) {
    const item = items.find((notification) => notification.id === id);
    if (item?.type === 'SYSTEM') {
      await acknowledgeSystemMessage({ messageId: id });
    } else {
      await markAlertSeen({ notificationId: id });
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, readAt: new Date() } : item)),
    );
  }
  return (
    <section className="dashboard-panel">
      <h2>Notifications</h2>
      {items.map((notification) => (
        <article
          key={notification.id}
          className={notification.readAt ? 'notification is-read' : 'notification'}
        >
          <div>
            <strong>{notification.title}</strong>
            <p>{notification.body}</p>
            <time dateTime={notification.createdAt.toISOString()}>
              {notification.createdAt.toLocaleString()}
            </time>
          </div>
          {!notification.readAt && (
            <button type="button" onClick={() => void markRead(notification.id)}>
              Mark seen
            </button>
          )}
        </article>
      ))}
      {!items.length && <p>You’re all caught up.</p>}
    </section>
  );
}

export default DashboardNotificationsPanel;
