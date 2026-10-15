'use client';

export function ComplianceFilters({ status = '', type = '' }: { status?: string; type?: string }) {
  return (
    <form action="/compliance" className="filters">
      <label>
        Status
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {['VALID', 'EXPIRING_SOON', 'EXPIRED', 'EXEMPT'].map((value) => (
            <option value={value} key={value}>
              {value.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <label>
        Document type
        <select name="type" defaultValue={type}>
          <option value="">All types</option>
          {[
            'VEHICLE_REGISTRATION',
            'INSURANCE',
            'CDL',
            'MEDICAL_CARD',
            'PERMIT',
            'IFTA_LICENCE',
            'OTHER',
          ].map((value) => (
            <option value={value} key={value}>
              {value.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Apply filters</button>
    </form>
  );
}
