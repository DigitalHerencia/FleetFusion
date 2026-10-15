'use client';

import { useState } from 'react';

import { updateNotificationPreferences } from '../lib/notificationActions';
import type { NotificationPreferences } from '../types';

export function NotificationPreferencesForm({ preferences }: { preferences: NotificationPreferences }) {
  const categories =
    preferences.categories && typeof preferences.categories === 'object'
      ? (preferences.categories as Record<string, boolean>)
      : {};
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(formData: FormData) {
    setSaving(true);
    setMessage('');
    try {
      const result = await updateNotificationPreferences({
        emailEnabled: formData.get('emailEnabled') === 'on',
        smsEnabled: formData.get('smsEnabled') === 'on',
        inAppEnabled: formData.get('inAppEnabled') === 'on',
        categories: Object.fromEntries(
          ['SYSTEM', 'ALERT', 'REMINDER', 'DIGEST'].map((category) => [
            category,
            formData.get(`category-${category}`) === 'on',
          ]),
        ),
      });
      setMessage(`Preferences saved at ${new Date(result.updatedAt).toLocaleTimeString()}.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to save preferences.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={submit} className="preferences-form">
      <fieldset>
        <legend>Delivery channels</legend>
        <label>
          <input type="checkbox" name="inAppEnabled" defaultChecked={preferences.inAppEnabled} />{' '}
          In-app
        </label>
        <label>
          <input type="checkbox" name="emailEnabled" defaultChecked={preferences.emailEnabled} />{' '}
          Email
        </label>
        <label>
          <input type="checkbox" name="smsEnabled" defaultChecked={preferences.smsEnabled} /> SMS
        </label>
      </fieldset>
      <fieldset>
        <legend>Notification categories</legend>
        {['SYSTEM', 'ALERT', 'REMINDER', 'DIGEST'].map((category) => (
          <label key={category}>
            <input
              type="checkbox"
              name={`category-${category}`}
              defaultChecked={categories[category] !== false}
            />
            {category[0] + category.slice(1).toLowerCase()}
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save preferences'}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
