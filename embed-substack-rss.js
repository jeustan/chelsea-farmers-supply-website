/**
 * RSS-based Substack embed (client-side)
 * - Finds elements matching `.substack-feed-embed` or `#substack-feed-embed`
 * - Pulls configuration from data-* attributes with sensible defaults
 * - Fetches the Substack RSS (via rss2json) and renders simple cards
 *
 * Optional global defaults:
 *   window.SubstackFeedWidget = { substackUrl: '', posts: 3, showImages: true, showDates: true };
 */
function embedSubstackRSS () {
  const globalDefaults = (window.SubstackFeedWidget || {});
  const defaults = {
    substackUrl: '',
    posts: 1,
    showImages: true,
    showDates: true,
    ...globalDefaults
  };

  const containers = document.querySelectorAll('.substack-feed-embed, #substack-feed-embed');
  if (!containers.length) return;

  const fmtDate = (iso) => {
    try {
      // Use reader’s locale; tweak if you want a fixed one
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso));
    } catch {
      return '';
    }
  };

  const normalizeUrl = (u) => {
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  };

  const extractFirstImg = (html) => {
    if (!html) return null;
    const m = html.match(/<img[^>]+src="([^"]+)"/i);
    return m ? m[1] : null;
  };

  const sanitizeContent = (html) => {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove embedded subscribe forms and interactive UI that should not render inside cards.
    doc.querySelectorAll(
      '.subscription-widget-wrap-editor, .subscription-widget, form, input, button, script, style'
    ).forEach((el) => el.remove());

    return doc.body ? doc.body.innerHTML : html;
  };

  const parseRssXmlItems = (xml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const parseErr = doc.querySelector('parsererror');
    if (parseErr) {
      throw new Error('Invalid RSS XML response');
    }

    return Array.from(doc.querySelectorAll('item')).map((item) => {
      const getText = (selector) => {
        const el = item.querySelector(selector);
        return el ? (el.textContent || '').trim() : '';
      };

      const encodedNode =
        item.getElementsByTagName('content:encoded')[0] ||
        item.getElementsByTagNameNS('*', 'encoded')[0] ||
        null;
      const encodedContent = encodedNode ? (encodedNode.textContent || '').trim() : '';

      return {
        title: getText('title'),
        link: getText('link'),
        pubDate: getText('pubDate'),
        content: encodedContent || getText('description')
      };
    });
  };

  const buildCard = (post, opts) => {
    const a = document.createElement('a');
    a.className = 'substack-card';
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = post.link;

    const wrap = document.createElement('div');
    wrap.className = 'substack-post';

    if (opts.showImages) {
      const imgUrl = extractFirstImg(post.content);
      if (imgUrl) {
        const img = document.createElement('img');
        img.className = 'substack-thumbnail';
        img.loading = 'lazy';
        img.sizes = '568px';
        img.alt = post.title || 'Substack post image';
        img.src = imgUrl;
        wrap.appendChild(img);
      }
    }

    const body = document.createElement('div');

    const h3 = document.createElement('h3');
    h3.className = 'substack-title';
    h3.textContent = post.title || 'Untitled';
    body.appendChild(h3);

    if (opts.showDates && post.pubDate) {
      const pDate = document.createElement('p');
      pDate.className = 'substack-date';
      pDate.textContent = fmtDate(post.pubDate);
      body.appendChild(pDate);
    }

    const pContent = document.createElement('div');
    pContent.className = 'substack-content';
    pContent.innerHTML = sanitizeContent(post.content);
    body.appendChild(pContent);
   
    wrap.appendChild(body);

    // Make whole card link to substack post
    // a.appendChild(wrap);
    return wrap

  };

  const fetchWithTimeout = (url, ms = 10000) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    return fetch(url, { signal: ctl.signal }).finally(() => clearTimeout(t));
  };

  containers.forEach(async (container) => {
    const cfg = {
      substackUrl: container.getAttribute('data-substack-url') || defaults.substackUrl,
      posts: parseInt(container.getAttribute('data-posts'), 10) || defaults.posts,
      showImages: (container.getAttribute('data-show-images') || `${defaults.showImages}`) !== 'false',
      showDates: (container.getAttribute('data-show-dates') || `${defaults.showDates}`) !== 'false'
    };

    if (!cfg.substackUrl) {
      container.innerHTML = '<p class="substack-error">Error: No Substack URL specified.</p>';
      return;
    }
    
    // (copilot) Add timestamp to bust rss2json cache (it can cache empty results for a while)
    const ts = new Date().getTime();
    const rssUrl = `/.netlify/functions/substack-feed`;

    // Minimal skeleton while loading (optional)
    container.innerHTML = '<div class="substack-skeleton">Loading…</div>';

    // Debugging: log the feed URL and responses to help diagnose empty results
    console.info('Substack widget fetching RSS via:', rssUrl);

    try {
      const res = await fetchWithTimeout(rssUrl, 12000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Some environments return RSS XML directly, others return JSON.
      const raw = await res.text();
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      let items = [];

      const looksLikeJson = /^[\s\n\r]*[\[{]/.test(raw);

      if (contentType.includes('application/json') || looksLikeJson) {
        const data = JSON.parse(raw);
        console.debug('Substack JSON response:', data);
        if (!Array.isArray(data.items)) {
          throw new Error(data.message || 'Failed to parse JSON feed');
        }
        items = data.items;
      } else {
        items = parseRssXmlItems(raw);
        console.debug('Substack XML response parsed items:', items.length);
      }

      const posts = items.slice(0, Math.max(1, cfg.posts));
      if (!posts.length) {
        container.innerHTML = '<p class="substack-empty">No posts available. Ensure your Substack has published posts and they are set to "everyone" audience. Feed caches can take a few minutes to update.</p>';
        return;
      }

      // Clear and render
      container.innerHTML = '';
      posts.forEach((post) => {
        container.appendChild(buildCard(post, cfg));
      });
    } catch (err) {
      console.error('Substack feed error:', err);
      container.innerHTML = '<p class="substack-error">Could not load posts. Please try again later.</p>';
    }
  });
}