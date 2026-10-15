import {
  createSystemDocument,
  deleteSystemDocument,
  updateSystemDocument,
} from '../lib/adminActions';
import type { getSystemDocuments } from '../lib/adminFetchers';

type Document = Awaited<ReturnType<typeof getSystemDocuments>>[number];

async function addDocument(formData: FormData) {
  'use server';
  await createSystemDocument(formData);
}

async function saveDocument(formData: FormData) {
  'use server';
  await updateSystemDocument(formData);
}

async function removeDocument(formData: FormData) {
  'use server';
  await deleteSystemDocument(formData);
}

export function DocumentsTable({ documents }: { documents: Document[] }) {
  return (
    <div className="space-y-6">
      <form
        action={addDocument}
        className="bg-card grid gap-3 rounded-lg border p-4 md:grid-cols-2"
      >
        <h2 className="text-lg font-semibold md:col-span-2">Add system document</h2>
        <label className="grid gap-1 text-sm">
          Title
          <input className="rounded-md border px-3 py-2" name="title" required />
        </label>
        <label className="grid gap-1 text-sm">
          Slug
          <input className="rounded-md border px-3 py-2" name="slug" required />
        </label>
        <label className="grid gap-1 text-sm">
          Category
          <input className="rounded-md border px-3 py-2" name="category" placeholder="RUNBOOK" />
        </label>
        <label className="grid gap-1 text-sm">
          Organization ID (optional)
          <input className="rounded-md border px-3 py-2" name="organizationId" />
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          Content (JSON)
          <textarea
            className="min-h-24 rounded-md border px-3 py-2 font-mono text-xs"
            defaultValue='{"body":""}'
            name="content"
            required
          />
        </label>
        <button
          className="bg-primary text-primary-foreground w-fit rounded-md px-4 py-2"
          type="submit"
        >
          Create document
        </button>
      </form>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Document</th>
              <th className="p-3">Scope</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr className="border-t align-top" key={document.id}>
                <td className="p-3">
                  <form action={saveDocument} className="grid gap-2">
                    <input name="id" type="hidden" value={document.id} />
                    <input
                      aria-label="Document title"
                      className="rounded border px-2 py-1 font-medium"
                      name="title"
                      required
                      defaultValue={document.title}
                    />
                    <input
                      aria-label="Document slug"
                      className="rounded border px-2 py-1"
                      name="slug"
                      required
                      defaultValue={document.slug}
                    />
                    <input
                      aria-label="Category"
                      className="rounded border px-2 py-1"
                      name="category"
                      defaultValue={document.category ?? ''}
                    />
                    <input
                      name="organizationId"
                      type="hidden"
                      value={document.organizationId ?? ''}
                    />
                    <textarea
                      aria-label="Document JSON content"
                      className="min-h-20 rounded border px-2 py-1 font-mono text-xs"
                      name="content"
                      defaultValue={JSON.stringify(document.content, null, 2)}
                    />
                    <button className="text-primary w-fit underline" type="submit">
                      Save
                    </button>
                  </form>
                </td>
                <td className="p-3">{document.organization?.name ?? 'System-wide'}</td>
                <td className="p-3 whitespace-nowrap">{document.updatedAt.toLocaleDateString()}</td>
                <td className="p-3">
                  <form action={removeDocument}>
                    <input name="id" type="hidden" value={document.id} />
                    <button className="text-destructive underline" type="submit">
                      Archive
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!documents.length && (
              <tr>
                <td className="text-muted-foreground p-6 text-center" colSpan={4}>
                  No system documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
