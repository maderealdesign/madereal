// Standard UI icon outlines are sampled into a point cloud; SVG shapes are never painted.
// Geometry follows the Lucide icon family. Attribution: /assets/lucide-license.txt.
const outlines={
 website:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 9v11M12 13h5M12 16h3"/>',
 devices:'<path d="M18 8V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8M10 17v4M6 21h6"/><rect x="15" y="8" width="7" height="13" rx="2"/><path d="M18 18h1"/>',
 phone:'<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4V3a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384Z"/>',
 pin:'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
 search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 6 6"/>',
 support:'<path d="M3 14v-3a9 9 0 0 1 18 0v7a4 4 0 0 1-4 4h-3"/><rect x="2" y="11" width="5" height="8" rx="2"/><rect x="17" y="11" width="5" height="8" rx="2"/>'
};
export const lightStage=()=>`<div class="light-field" aria-hidden="true"><canvas></canvas><svg class="particle-shapes" viewBox="0 0 24 24">${Object.entries(outlines).map(([name,paths])=>`<g data-particle-shape="${name}">${paths}</g>`).join('')}</svg></div>`;
export const lightField=()=>`<button class="motion-toggle" type="button" data-motion-toggle hidden><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 4v8M11 4v8"/></svg><span>Pause motion</span></button>`;
const benefits=[
 ['website','A website made<br><em>for you.</em>','Free homepage preview, custom design and help with the wording. A website that feels like your business.'],
 ['devices','Looks great on<br><em>every screen.</em>','Your services, photos and work — easy to see on phones, tablets and computers.'],
 ['phone','Easy calls<br><em>and enquiries.</em>','A contact form and a tap-to-call button. Customers can ask for a quote or give you a ring.'],
 ['pin','Pages for the<br><em>areas you cover.</em>','Start with 8 local area pages. Working somewhere new? Ask us to add more.'],
 ['search','Help with<br><em>Google and Maps.</em>','Google-friendly pages and help with your Google Maps listing. Make your business details clear and up to date.'],
 ['support','Your website,<br><em>looked after.</em>','Hosting, a secure connection, website updates and a designer you can message.']
];
export const particleBenefit=(index,offer='monthly')=>{let [name,heading,copy]=benefits[index];if(offer==='one-off'&&name==='support'){heading='Your website.<br><em>Yours to keep.</em>';copy='You receive the finished website files with no required MadeReal monthly fee. Hosting and future changes are agreed separately.';}return `<section class="particle-benefit ${index%2?'particle-benefit-reverse':''}" data-light-scene="${name}" aria-labelledby="benefit-${name}">${lightField()}<div class="particle-benefit-layout wrap"><div class="particle-benefit-copy"><p class="eyebrow">${String(index+1).padStart(2,'0')} / 06 · YOUR ${offer==='one-off'?'£197 WEBSITE':'£35 WEBSITE PLAN'}</p><h2 id="benefit-${name}">${heading}</h2><p>${copy}</p></div><div class="particle-icon-space" data-particle-anchor aria-hidden="true"></div></div></section>`;};
