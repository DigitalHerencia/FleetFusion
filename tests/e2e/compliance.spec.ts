import { test, expect } from '@playwright/test'

test.describe('compliance flow', () => {
  test('document upload and remediation', async ({ page }) => {
    await page.setContent(`
      <input type="file" id="file" />
      <button id="upload">Upload</button>
      <div id="alert"></div>
      <button id="resolve">Resolve</button>
      <script>
      document.getElementById('upload').onclick = () => {
        document.getElementById('alert').textContent = 'Document uploaded';
      };
      document.getElementById('resolve').onclick = () => {
        document.getElementById('alert').textContent = '';
      };
      </script>
    `)

    await page.setInputFiles('#file', {
      name: 'doc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test')
    })
    await page.click('#upload')
    await expect(page.locator('#alert')).toHaveText('Document uploaded')
    await page.click('#resolve')
    await expect(page.locator('#alert')).toHaveText('')
  })
})
