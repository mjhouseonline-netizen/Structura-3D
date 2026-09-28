// Run with: electron scripts/smoke-desktop.cjs
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const profile = path.resolve('test-output/profile');
fs.mkdirSync(profile, { recursive: true });
app.setPath('userData', profile);
app.setPath('sessionData', profile);
const errors = [];
const deadline = setTimeout(() => { console.error('FAIL: desktop startup timed out'); app.exit(1); }, 30000);
app.on('web-contents-created', (_event, contents) => {
  contents.on('console-message', details => {
    if (details.level === 'error' && !/ERR_BLOCKED_BY_CLIENT/.test(details.message)) errors.push(details.message);
  });
  contents.once('did-finish-load', async () => {
    try {
      const result = await contents.executeJavaScript(`(async () => {
        await new Promise(resolve => setTimeout(resolve, 1800));
        [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Skip Tour')?.click();
        await new Promise(resolve => setTimeout(resolve, 300));
        const canvas = document.querySelector('canvas');
        const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
        let networkBlocked = false;
        try { await fetch('https://example.com'); } catch { networkBlocked = true; }
        return { title: document.title, offline: document.body.innerText.includes('Offline'), canvas: !!canvas, webgl: !!gl, networkBlocked, nodeAccess: typeof require };
      })()`);
      assert.equal(result.offline, true);
      assert.equal(result.canvas, true);
      assert.equal(result.webgl, true);
      assert.equal(result.networkBlocked, true);
      assert.equal(result.nodeAccess, 'undefined');
      const shot = await contents.capturePage();
      fs.writeFileSync('test-output/desktop.png', shot.toPNG());
      // Reload from an on-disk autosave containing an empty scene and two pages.
      await contents.executeJavaScript(`localStorage.setItem('structura_3d_project', JSON.stringify({
        project: { name: 'Offline restore check' }, objects: [], activePageId: 'empty',
        pages: [
          { id: 'empty', title: 'Empty design', type: '3d-space', objects: [], savedScenes: [] },
          { id: 'sheet', title: 'Preserved sheet', type: '2d-layout', objects: [], savedScenes: [] }
        ]
      }));`);
      await new Promise(resolve => { contents.once('did-finish-load', resolve); contents.reload(); });
      const restored = await contents.executeJavaScript(`(async () => {
        await new Promise(resolve => setTimeout(resolve, 1400));
        const saved = JSON.parse(localStorage.getItem('structura_3d_project'));
        return { name: document.querySelector('input[title="Click to rename project"]').value, objects: saved.objects.length, pages: saved.pages.length };
      })()`);
      assert.deepEqual(restored, { name: 'Offline restore check', objects: 0, pages: 2 });
      if (process.env.PORTABLE_EXECUTABLE_DIR) {
        assert.equal(app.getPath('userData'), path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'Structura Data', process.platform));
      }
      assert.deepEqual(errors, []);
      console.log('PASS desktop:', JSON.stringify(result));
      console.log('PASS restore:', JSON.stringify(restored));
      clearTimeout(deadline);
      BrowserWindow.getAllWindows().forEach(win => win.close());
      app.quit();
    } catch (error) { console.error(error); clearTimeout(deadline); app.exit(1); }
  });
});
require('../desktop/main.cjs');
