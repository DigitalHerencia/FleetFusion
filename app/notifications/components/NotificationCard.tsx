'use client';

import { useState } from 'react';

import { markNotificationRead } from '../lib/notificationActions';
import type { NotificationRecord } from '../types';

export function NotificationCard({ notification }: { notification: NotificationRecord }) {
  const [read, setRead] = useState(Boolean(notification.readAt || notification.status === 'READ'));
  const [error, setError] = useState('');
  async function markRead() {
    setError('');
    try {
      await markNotificationRead({ id: notification.id });
      setRead(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update this notification.');
    }
  }
  return (
    <article className={`notification-card${read ? 'is-read' : 'is-unread'}`}>
      <div>
        <p className="notification-meta">
          {notification.type} · {notification.channel.replaceAll('_', ' ')}
        </p>
        <h2>{notification.title}</h2>
        <p>{notification.body}</p>
        <time dateTime={new Date(notification.createdAt).toISOString()}>
          {new Date(notification.createdAt).toLocaleString()}
        </time>
        {error && <p role="alert">{error}</p>}
      </div>
      {!read && (
        <button type="button" onClick={markRead}>
          Mark as read
        </button>
      )}
    </article>
  );
}
