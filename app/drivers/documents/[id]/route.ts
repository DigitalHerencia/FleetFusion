import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await auth.requireOrgContext();
  const { id } = await params;
  const upload = await prisma.fileUpload.findFirst({
    where: {
      id,
      organizationId: context.orgId,
      relatedEntity: 'driver',
    },
    select: { fileName: true, mimeType: true, metadata: true },
  });
  if (!upload || !allowedMimeTypes.has(upload.mimeType)) {
    return new Response('Document not found', { status: 404 });
  }
  const metadata =
    upload.metadata && typeof upload.metadata === 'object' && !Array.isArray(upload.metadata)
      ? (upload.metadata as Record<string, unknown>)
      : {};
  const content = metadata['inlineContentBase64'];
  if (typeof content !== 'string') {
    return new Response('Document content is unavailable', { status: 404 });
  }
  const bytes = Buffer.from(content, 'base64');
  const safeName = upload.fileName.replace(/[\r\n"]/g, '_');
  return new Response(bytes, {
    headers: {
      'Content-Type': upload.mimeType,
      'Content-Length': String(bytes.byteLength),
      'Content-Disposition': `inline; filename="${safeName}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
