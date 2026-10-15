'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { deleteDocument, uploadComplianceFile } from '../lib/complianceActions';
import type { ComplianceDocumentRecord } from '../types';

export function ComplianceDetailClient({ document }: { document: ComplianceDocumentRecord }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const entity = document.vehicle
    ? document.vehicle.name || document.vehicle.plateNumber || 'Vehicle'
    : document.driver
      ? `${document.driver.firstName} ${document.driver.lastName}`
      : 'Organization';

  async function remove() {
    if (!window.confirm('Delete this compliance document?')) return;
    setBusy(true);
    setError('');
    try {
      await deleteDocument({ id: document.id });
      router.push('/compliance');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete this document.');
      setBusy(false);
    }
  }

  async function upload(formData: FormData) {
    const file = formData.get('file');
    if (!(file instanceof File) || !file.size) {
      setUploadMessage('Choose a file to upload.');
      return;
    }
    setUploadMessage('');
    try {
      const result = await uploadComplianceFile({
        documentId: document.id,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        file,
      });
      setUploadMessage(`Uploaded ${result.fileUrl}`);
      router.refresh();
    } catch (cause) {
      setUploadMessage(cause instanceof Error ? cause.message : 'Unable to upload file.');
    }
  }

  return (
    <main className="domain-page">
      <a href="/compliance">← Back to compliance</a>
      <header className="domain-header">
        <div>
          <h1>{document.title}</h1>
          <p>
            {document.type.replaceAll('_', ' ')} · {entity}
          </p>
        </div>
        <nav aria-label="Document actions">
          <a
            className="button"
            href={`/compliance/documents/${encodeURIComponent(document.id)}/edit`}
          >
            Edit
          </a>
          <button type="button" onClick={remove} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </nav>
      </header>
      {error && <p role="alert">{error}</p>}
      <dl>
        <dt>Status</dt>
        <dd>{document.status.replaceAll('_', ' ')}</dd>
        <dt>Description</dt>
        <dd>{document.description || '—'}</dd>
        <dt>Issue date</dt>
        <dd>{document.issueDate ? new Date(document.issueDate).toLocaleDateString() : '—'}</dd>
        <dt>Effective date</dt>
        <dd>
          {document.effectiveDate ? new Date(document.effectiveDate).toLocaleDateString() : '—'}
        </dd>
        <dt>Expiration date</dt>
        <dd>
          {document.expirationDate ? new Date(document.expirationDate).toLocaleDateString() : '—'}
        </dd>
        <dt>File</dt>
        <dd>{document.file?.url ? <a href={document.file.url}>Open document</a> : '—'}</dd>
        <dt>Created</dt>
        <dd>{new Date(document.createdAt).toLocaleString()}</dd>
      </dl>
      <form action={upload} className="compliance-upload">
        <label>
          Upload or replace document file
          <input type="file" name="file" required />
        </label>
        <button type="submit">Upload file</button>
        {uploadMessage && <p role="status">{uploadMessage}</p>}
      </form>
      {document.alerts?.length > 0 && (
        <section aria-labelledby="compliance-alerts-heading">
          <h2 id="compliance-alerts-heading">Expiration alerts</h2>
          <ul>
            {document.alerts.map((alert) => (
              <li key={alert.id}>
                {alert.severity} · {alert.state}
              </li>
            ))}
          </ul>
        </section>
      )}
      {document.auditLogs?.length > 0 && (
        <section aria-labelledby="compliance-audit-heading">
          <h2 id="compliance-audit-heading">Audit history</h2>
          <ol>
            {document.auditLogs.map((entry) => (
              <li key={entry.id}>
                {entry.action} · {new Date(entry.createdAt).toLocaleString()}
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
