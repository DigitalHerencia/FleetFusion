'use client';

import { type FormEvent, useState } from 'react';

import { uploadDriverDocs } from '../lib/driversMobileFlows';

export function DriverDocsUpload({ driverId }: { driverId: string }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) {
      setMessage('Choose a file to upload.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await uploadDriverDocs({
        driverId,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        type: String(form.get('type') ?? 'OTHER'),
        title: String(form.get('title') ?? '') || file.name,
        file,
      });
      formElement.reset();
      setMessage('Document uploaded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Document upload failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="domain-form">
      <h2>Upload driver document</h2>
      <label>
        Document title
        <input name="title" maxLength={200} />
      </label>
      <label>
        Type
        <select name="type">
          {['CDL', 'MEDICAL_CARD', 'PERMIT', 'INSURANCE', 'OTHER'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        File
        <input name="file" type="file" accept=".pdf,image/*" required />
      </label>
      <button disabled={busy}>{busy ? 'Uploading…' : 'Upload document'}</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}

export default DriverDocsUpload;
