'use client';

export function NotificationFilters({
  type = '',
  channel = '',
  unread = false,
}: {
  type?: string;
  channel?: string;
  unread?: boolean;
}) {
  return (
    <form action="/notifications" className="filters">
      <label>
        Type
        <select name="type" defaultValue={type}>
          <option value="">All types</option>
          {['SYSTEM', 'ALERT', 'REMINDER', 'DIGEST'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Channel
        <select name="channel" defaultValue={channel}>
          <option value="">All channels</option>
          {['IN_APP', 'EMAIL', 'SMS'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="checkbox-label">
        <input type="checkbox" name="unread" value="true" defaultChecked={unread} />
        Unread only
      </label>
      <button type="submit">Apply filters</button>
    </form>
  );
}
