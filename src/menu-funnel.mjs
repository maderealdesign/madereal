import {arrow} from './components.mjs';

export const menuFunnelAssets='<link rel="stylesheet" href="/menus-assets/menu-funnel.css"><script src="/menus-assets/menu-funnel.js" defer></script>';
export const menuWhatsApp='https://wa.me/447396710347?text=Hi%20Dom%2C%20I%27d%20like%20to%20ask%20about%20a%20MadeReal%20menu%20for%20my%20business.';

// Render this inside the page's #send-menu section. It is static HTML so Netlify
// registers both the file field and the enquiry fields when the site is deployed.
const uploadFunnel=`<div class="mf-funnel" data-menu-funnel>
 <form class="mf-form" name="Menu Photo Enquiry" method="POST" action="/menus/request-received/" enctype="multipart/form-data" data-netlify="true" netlify-honeypot="website-url" data-menu-photo-form>
  <input type="hidden" name="form-name" value="Menu Photo Enquiry"><input type="hidden" name="subject" value="New menu photo enquiry — %{submissionId}"><input type="hidden" name="source_page" value="/menus/"><input type="hidden" name="landing_page"><input type="hidden" name="referrer"><input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign">
  <p class="mf-honeypot" aria-hidden="true"><label>Leave this empty<input name="website-url" tabindex="-1" autocomplete="off"></label></p>
  <div class="mf-field"><label for="mf-email">Your email</label><input id="mf-email" name="email" type="email" autocomplete="email" maxlength="180" required placeholder="you@yourbusiness.co.uk"></div>
  <div class="mf-field"><label for="mf-file">Your menu</label><input id="mf-file" name="menu_file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif" required aria-describedby="mf-file-help"><p class="mf-help" id="mf-file-help">Upload one photo or PDF, up to 6 MB.</p><div class="mf-selected" data-mf-selected hidden><img data-mf-preview alt="Selected menu photo preview" width="56" height="56" hidden><span data-mf-filename></span><button type="button" data-mf-remove>Remove<span class="sr-only"> selected menu file</span></button></div></div>
  <button class="button mf-submit" type="submit">Send my menu ${arrow}</button>
  <p class="mf-note">We’ll email you about the setup before you pay. <a href="/privacy/">Privacy</a>.</p>
  <p class="mf-status" role="status" aria-live="polite" tabindex="-1" data-mf-status></p>
 </form>
 <div class="mf-success" data-mf-success hidden><h3 tabindex="-1" data-mf-success-heading>Menu received. Thank you.</h3><p>We’ll review it and email you about the setup. You’ll approve your design before it goes live.</p></div>
 <p class="mf-contact">Want to speak to us now? <a href="${menuWhatsApp}" target="_blank" rel="noopener noreferrer">WhatsApp Dom ${arrow}</a></p>
</div>`;

// The separate Sites export has no Netlify receiver. Preserve the established
// hand-off to the live intake instead of displaying a form that cannot deliver.
export const menuFunnel=process.env.HOSTING_TARGET==='sites'?`<div class="mf-funnel"><a class="button mf-submit" href="https://madereal.uk/menus/start/">Send my menu ${arrow}</a><p class="mf-note">Upload your menu through the live MadeReal website.</p><p class="mf-contact">Want to speak to us now? <a href="${menuWhatsApp}" target="_blank" rel="noopener noreferrer">WhatsApp Dom ${arrow}</a></p></div>`:uploadFunnel;
