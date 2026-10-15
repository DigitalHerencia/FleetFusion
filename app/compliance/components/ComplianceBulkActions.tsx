'use client';

import { useState } from 'react';

import { bulkImportComplianceRecords, generateExpirationAlerts } from '../lib/complianceActions';

export function ComplianceBulkActions() {
  const [result, setResult] = useState('');
  const [alertResult, setAlertResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);

  async function checkExpirations() {
    setChecking(true);
    setAlertResult('');
    try {
      const alerts = await generateExpirationAlerts({ thresholdDays: 30 });
      setAlertResult(`${alerts.length} new expiration alert(s) created.`);
    } catch (error) {
      setAlertResult(error instanceof Error ? error.message : 'Unable to check expirations.');
    } finally {
      setChecking(false);
    }
  }

  async function submit(formData: FormData) {
    setBusy(true);
    setResult('');
    try {
      const rows = JSON.parse(String(formData.get('rows') ?? '[]'));
      if (!Array.isArray(rows)) throw new Error('Paste a JSON array of document rows.');
      const imported = await bulkImportComplianceRecords({ rows, source: 'manual-import' });
      setResult(
        `${imported.importedCount} document(s) imported; ${imported.errors.length} row(s) rejected.`,
      );
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="compliance-actions">
      <div>
        <button type="button" onClick={checkExpirations} disabled={checking}>
          {checking ? 'Checking…' : 'Check expiration dates'}
        </button>
        {alertResult && <p role="status">{alertResult}</p>}
      </div>
      <details className="bulk-import">
        <summary>Bulk import documents</summary>
        <form action={submit}>
          <label htmlFor="compliance-import-rows">
            Paste a JSON array of compliance document records
          </label>
          <textarea id="compliance-import-rows" name="rows" rows={5} defaultValue="[]" required />
          <button type="submit" disabled={busy}>
            {busy ? 'Importing…' : 'Import'}
          </button>
          {result && <p role="status">{result}</p>}
        </form>
      </details>
    </section>
  );
}
