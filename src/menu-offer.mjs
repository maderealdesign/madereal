// One menu offer across the public landing page, guides and enquiry forms.
// The website plans are separate products and do not use these terms.
export const menuTrialTerms='Your free month starts on the day your menu is created. After that, subscribe for £19/month per venue to keep editing. Your public menu stays online. No card upfront and no automatic charge.';

export const renderMenuOffer=(modifier='')=>`<div class="menu-offer ${modifier}"><strong><span>100% completely</span> FREE</strong><small>for the first month</small><p>Then £19/month per venue.</p><p class="menu-offer-assurance">No card upfront. No automatic charge.</p></div>`;

export const menuOfferSchema=url=>[
 {'@type':'Offer',name:'Free first month of MadeReal Menus',url,priceCurrency:'GBP',price:'0',description:menuTrialTerms},
 {'@type':'Offer',name:'Menu editing after the free month',url,priceCurrency:'GBP',price:'19',description:'Optional subscription after the free month. Subscribe to continue editing; no automatic charge. The public menu stays online.',priceSpecification:{'@type':'UnitPriceSpecification',price:19,priceCurrency:'GBP',unitText:'month, per venue'}}
];
