import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {refreshCatalogueHtml} from '../../src/menu-catalogue-render.mjs';

const source = 'https://manage.madereal.uk/api/menu-catalogue';
export async function catalogueResponse(request, {fetchCatalogue = () => fetch(source, {signal:AbortSignal.timeout(8000)}), template = () => readFile(resolve(process.env.LAMBDA_TASK_ROOT || process.cwd(),'dist/menus/browse/index.html'),'utf8')} = {}) {
  if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed.', {status:405,headers:{Allow:'GET, HEAD'}});
  const html = await template();
  try {
    const response = await fetchCatalogue();
    if (!response.ok) throw new Error('Catalogue unavailable.');
    const page = refreshCatalogueHtml(html,await response.json());
    return new Response(request.method==='HEAD'?null:page,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate','Netlify-CDN-Cache-Control':'public, s-maxage=300, stale-while-revalidate=60','X-Content-Type-Options':'nosniff'}});
  } catch {
    // Keep the last verified build-time list usable during a temporary data outage.
    return new Response(request.method==='HEAD'?null:html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','Netlify-CDN-Cache-Control':'public, s-maxage=30','X-Menu-Catalogue':'verified-build-fallback','X-Content-Type-Options':'nosniff'}});
  }
}
export default catalogueResponse;
export const config = {path:'/menus/browse/',preferStatic:false};
