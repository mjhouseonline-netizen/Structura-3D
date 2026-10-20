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
      const pageCreation = await contents.executeJavaScript(`(async () => {
        const before = document.querySelectorAll('[data-tour="tab-3d-space"]').length;
        const newPageButton = [...document.querySelectorAll('button')].find(button => button.textContent.includes('New Page'));
        if (!newPageButton) return { opened: false, before, pages: before };
        newPageButton.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        const blankOption = [...document.querySelectorAll('button')].find(button => button.textContent.includes('3D Design Space (Blank)'));
        const layoutOption = [...document.querySelectorAll('button')].find(button => button.textContent.includes('2D LayOut Blueprint Sheet'));
        const menu = layoutOption?.closest('div.absolute');
        const menuRect = menu?.getBoundingClientRect();
        const visible = !!menuRect && menuRect.bottom <= window.innerHeight && menuRect.right <= window.innerWidth;
        if (!blankOption || !layoutOption) return { opened: true, before, pages: before, layout: !!layoutOption, visible };
        blankOption.click();
        await new Promise(resolve => setTimeout(resolve, 150));
        return { opened: true, before, pages: [...document.querySelectorAll('[data-tour="tab-3d-space"]')].length, layout: true, visible };
      })()`);
      assert.equal(pageCreation.opened, true);
      assert.equal(pageCreation.pages, pageCreation.before + 1);
      assert.equal(pageCreation.layout, true);
      assert.equal(pageCreation.visible, true);
      if (process.env.PORTABLE_EXECUTABLE_DIR) {
        assert.equal(app.getPath('userData'), path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'Structura Data', process.platform));
      }
      assert.deepEqual(errors, []);
      console.log('PASS desktop:', JSON.stringify(result));
      console.log('PASS page creation:', JSON.stringify(pageCreation));
      clearTimeout(deadline);
      BrowserWindow.getAllWindows().forEach(win => win.close());
      app.quit();
    } catch (error) { console.error(error); clearTimeout(deadline); app.exit(1); }
  });
});
require('../desktop/main.cjs');
