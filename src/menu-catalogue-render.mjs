export const CATALOGUE_URL = 'https://madereal.uk/menus/browse/';
const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const text = (value, limit) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit) : '';
export const searchText = value => text(value, 1000).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replaceAll('&', ' and ').toLowerCase().replace(/\s+/g, ' ').trim();
const townFor = menu => menu.locality.split(',').at(-1)?.trim() || '';

/** Accept the deliberately public projection, never a raw restaurant/account record. */
export function catalogueMenus(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.menus) || value.menus.length > 500 || value.hasMore || value.nextCursor) throw new Error('The complete public menu catalogue is unavailable.');
  const ids = new Set(), urls = new Set();
  return value.menus.map(raw => {
    if (!raw || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.venueId ?? '') || /(?:^|-)(?:testing|test|demo)(?:-|$)/.test(raw.venueId) || ids.has(raw.venueId)) throw new Error('Invalid catalogue identity.');
    const name = text(raw.name, 180), address = text(raw.address, 300), locality = text(raw.locality, 100);
    const url = new URL(raw.url);
    if (!name || url.protocol !== 'https:' || !/^[a-z0-9-]+\.madereal\.uk$/.test(url.hostname) || ['manage.madereal.uk','www.madereal.uk'].includes(url.hostname) || url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash || urls.has(url.href)) throw new Error('Invalid public menu destination.');
    let logo = '';
    if (raw.logo) {
      const image = new URL(raw.logo);
      if (image.origin !== url.origin || image.search || image.hash || !/^\/(?:assets|venues)\/[a-zA-Z0-9_./%-]+\.(?:webp|png|jpe?g|svg)$/i.test(image.pathname)) throw new Error('Invalid catalogue logo.');
      logo = image.href;
    }
    ids.add(raw.venueId); urls.add(url.href);
    return { venueId: raw.venueId, name, url: url.href, logo, address, locality };
  }).sort((a,b) => a.name.localeCompare(b.name, 'en-GB'));
}

export function catalogueSchema(menus) {
  return { '@type': 'ItemList', '@id': CATALOGUE_URL + '#menus', name: 'Local menus by MadeReal', url: CATALOGUE_URL, numberOfItems: menus.length,
    itemListElement: menus.map((menu,index) => ({ '@type': 'ListItem', position: index + 1, name: menu.name, url: menu.url })) };
}

export function catalogueContent(menus) {
  const towns = [...new Set(menus.map(townFor).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'en-GB'));
  return `<div class="mc-finder" data-menu-finder>
    <div class="mc-tools"><label>Find a menu<input type="search" placeholder="Business name or town" autocomplete="off" spellcheck="false" data-menu-search></label><label>Where?<select data-menu-town><option value="">Everywhere</option>${towns.map(town=>`<option value="${escape(town)}">${escape(town)}</option>`).join('')}</select></label></div>
    <div class="mc-results-heading"><p data-menu-count role="status" aria-live="polite">${menus.length} ${menus.length===1?'menu':'menus'} to explore</p><button type="button" data-menu-reset hidden>Clear search</button></div>
    <ul class="mc-grid" aria-label="Local restaurant and café menus">${menus.map(menu=>`<li data-menu-entry data-menu-search-text="${escape(searchText(menu.name+' '+menu.address+' '+menu.locality))}" data-menu-locality="${escape(townFor(menu))}"><a class="mc-card" href="${escape(menu.url)}"><span class="mc-logo">${menu.logo?`<img src="${escape(menu.logo)}" alt="" width="96" height="96" loading="lazy" decoding="async">`:`<span aria-hidden="true">${escape(menu.name.charAt(0))}</span>`}</span><div><span class="mc-place">${escape(menu.locality || 'Food & drink')}</span><h2>${escape(menu.name)}</h2>${menu.address?`<p>${escape(menu.address)}</p>`:''}</div><span class="mc-open">View menu <span aria-hidden="true">↗</span></span></a></li>`).join('')}</ul>
    <div class="mc-empty" data-menu-empty hidden><h2>No menus found.</h2><p>Try another business name or choose a different town.</p></div>
  </div>`;
}

/** Preserve the built site's asset versions, indexing mode, navigation and metadata. */
export function refreshCatalogueHtml(html, data) {
  const menus = catalogueMenus(data);
  if (!html.includes('<!-- menu-catalogue-start -->') || !html.includes('<!-- menu-catalogue-end -->')) throw new Error('Catalogue template is missing.');
  return html.replace(/<!-- menu-catalogue-start -->[\s\S]*?<!-- menu-catalogue-end -->/, () => `<!-- menu-catalogue-start -->${catalogueContent(menus)}<!-- menu-catalogue-end -->`)
    .replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (script, raw) => {
      const data = JSON.parse(raw);
      if (!Array.isArray(data['@graph'])) return script;
      data['@graph'] = data['@graph'].map(node=>node['@id']===CATALOGUE_URL+'#menus'?catalogueSchema(menus):node);
      return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<','\\u003c')}</script>`;
    });
}
