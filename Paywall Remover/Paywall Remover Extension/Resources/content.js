// Paywall Remover — content script.
// Cleans up client-side paywall UI: overlays/modals, scroll locks,
// blurred or faded content, and truncated article containers.
(() => {
  const SELECTORS = [
    '[class*="paywall" i]', '[id*="paywall" i]',
    '[class*="regwall" i]', '[id*="regwall" i]',
    '[class*="piano" i][class*="modal" i]', '.tp-modal', '.tp-backdrop',
    '[class*="subscribe-wall" i]', '[class*="subscription-wall" i]',
    '[class*="meter-wall" i]', '[class*="gateway" i][class*="modal" i]',
    '[id*="gateway-content" i]', '.fc-ab-root', '[class*="adblock" i][class*="modal" i]',
    '[data-testid*="paywall" i]', '[aria-label*="paywall" i]'
  ];

  const BLUR_PROPS = ['filter', 'webkitFilter'];
  let enabled = true;
  let removed = 0;

  function isOverlay(el) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') return false;
    const r = el.getBoundingClientRect();
    const coversScreen = r.width >= innerWidth * 0.6 && r.height >= innerHeight * 0.5;
    const highZ = parseInt(cs.zIndex, 10) >= 100;
    const text = (el.innerText || '').toLowerCase();
    const paywallText = /subscribe|subscription|sign in to (read|continue)|create (a free )?account|already a subscriber|free articles|continue reading|unlock/.test(text);
    return coversScreen && highZ && (paywallText || text.trim().length < 20);
  }

  function unlockScroll() {
    document.documentElement.classList.add('pwr-active');
    for (const el of [document.documentElement, document.body]) {
      if (!el) continue;
      el.style.setProperty('overflow', 'auto', 'important');
      el.classList.remove('modal-open', 'no-scroll', 'noscroll', 'overflow-hidden', 'tp-modal-open');
    }
  }

  function unblur(root) {
    root.querySelectorAll('article, main, [class*="article" i], [class*="content" i], [class*="story" i]').forEach(el => {
      const cs = getComputedStyle(el);
      if (BLUR_PROPS.some(p => (cs[p] || '').includes('blur'))) {
        el.style.setProperty('filter', 'none', 'important');
        el.style.setProperty('-webkit-filter', 'none', 'important');
      }
      if (cs.userSelect === 'none') el.style.setProperty('user-select', 'text', 'important');
      if (parseFloat(cs.opacity) < 1 && el.textContent.length > 200) el.style.setProperty('opacity', '1', 'important');
      // Truncated containers ("fade-out" teasers)
      if ((cs.maxHeight !== 'none' && cs.overflow === 'hidden' && el.scrollHeight > el.clientHeight + 50)) {
        el.style.setProperty('max-height', 'none', 'important');
        el.style.setProperty('overflow', 'visible', 'important');
      }
      if ((cs.maskImage || cs.webkitMaskImage || '').includes('gradient')) {
        el.style.setProperty('mask-image', 'none', 'important');
        el.style.setProperty('-webkit-mask-image', 'none', 'important');
      }
    });
    // Revive content hidden behind paywall attributes
    root.querySelectorAll('[hidden][class*="article" i], [class*="article-body" i][style*="display: none"]').forEach(el => {
      el.removeAttribute('hidden');
      el.style.setProperty('display', 'block', 'important');
    });
  }

  function clean() {
    if (!enabled || !document.body) return;
    document.querySelectorAll(SELECTORS.join(',')).forEach(el => {
      // Don't remove the article itself if a site names it e.g. "paywall-article"
      if (el.querySelector('article') || el.matches('article, main') || el === document.body) return;
      el.remove();
      removed++;
    });
    document.body.querySelectorAll('div, section, aside, iframe').forEach(el => {
      if (el.isConnected && isOverlay(el)) { el.remove(); removed++; }
    });
    unlockScroll();
    unblur(document);
  }

  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    setTimeout(() => { pending = false; clean(); }, 300);
  });

  function start() {
    clean();
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  }

  const host = location.hostname;
  browser.storage.local.get({ disabledSites: [], globalEnabled: true }).then(({ disabledSites, globalEnabled }) => {
    enabled = globalEnabled && !disabledSites.includes(host);
    if (enabled) start();
  });

  browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'clean') { enabled = true; start(); sendResponse({ removed }); }
    else if (msg.type === 'status') sendResponse({ removed, enabled, host });
    return true;
  });
})();
