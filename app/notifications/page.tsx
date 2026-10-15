import { MarkAllReadButton } from './components/MarkAllReadButton';
import { NotificationFilters } from './components/NotificationFilters';
import { NotificationList } from './components/NotificationList';
import { getUnreadCount, getUserNotifications } from './lib/notificationFetchers';

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; channel?: string; unread?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications({
      type: params.type || undefined,
      channel: params.channel || undefined,
      unreadOnly: params.unread === 'true',
      page: params.page || 1,
      pageSize: 25,
    }),
    getUnreadCount(),
  ]);

  return (
    <main className="domain-page">
      <header className="domain-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </p>
        </div>
        <a className="button" href="/notifications/preferences">
          Notification preferences
        </a>
        <MarkAllReadButton />
      </header>
      <NotificationFilters
        {...(params.type ? { type: params.type } : {})}
        {...(params.channel ? { channel: params.channel } : {})}
        unread={params.unread === 'true'}
      />
      <NotificationList notifications={notifications} />
    </main>
  );
}
