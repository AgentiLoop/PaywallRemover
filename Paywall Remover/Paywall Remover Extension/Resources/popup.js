(async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const host = tab && tab.url ? new URL(tab.url).hostname : '';
  const $ = id => document.getElementById(id);
  $('host').textContent = host || 'this site';

  const { disabledSites, globalEnabled } = await browser.storage.local.get({ disabledSites: [], globalEnabled: true });
  $('global').checked = globalEnabled;
  $('site').checked = !disabledSites.includes(host);

  $('global').onchange = e => browser.storage.local.set({ globalEnabled: e.target.checked });
  $('site').onchange = async e => {
    const { disabledSites: list } = await browser.storage.local.get({ disabledSites: [] });
    const next = e.target.checked ? list.filter(h => h !== host) : [...new Set([...list, host])];
    await browser.storage.local.set({ disabledSites: next });
    browser.tabs.reload(tab.id);
  };

  $('clean').onclick = async () => {
    try {
      const r = await browser.tabs.sendMessage(tab.id, { type: 'clean' });
      $('status').textContent = `Removed ${r.removed} element(s).`;
    } catch {
      $('status').textContent = 'Cannot run on this page.';
    }
  };

  try {
    const s = await browser.tabs.sendMessage(tab.id, { type: 'status' });
    $('status').textContent = `Removed ${s.removed} element(s) on this page.`;
  } catch {}
})();
