import { NotificationPreferencesForm } from '../components/NotificationPreferencesForm';
import { getNotificationPreferences } from '../lib/notificationFetchers';

export default async function NotificationPreferencesPage() {
  const preferences = await getNotificationPreferences();
  return (
    <main className="domain-page">
      <a href="/notifications">← Back to notifications</a>
      <h1>Notification preferences</h1>
      <p>Choose which delivery channels and notification categories you want enabled.</p>
      <NotificationPreferencesForm preferences={preferences} />
    </main>
  );
}
