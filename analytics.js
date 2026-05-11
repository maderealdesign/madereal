// Universal Analytics Tracking Script
// This script automatically tracks clicks and pushes data to GA4, Google Tag Manager, and Meta Pixel.

function trackEvent(eventName, eventParams = {}) {
    console.log(`[Analytics] Tracked Event: ${eventName}`, eventParams);

    // Google Analytics 4 (GA4)
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
    }
    
    // Google Tag Manager (GTM)
    if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
            'event': eventName,
            ...eventParams
        });
    }

    // Meta / Facebook Pixel
    if (typeof fbq === 'function') {
        fbq('trackCustom', eventName, eventParams);
    }
}

// Auto-track all elements with data-track attributes
document.addEventListener('DOMContentLoaded', () => {
    const trackableElements = document.querySelectorAll('[data-track]');
    
    trackableElements.forEach(el => {
        el.addEventListener('click', () => {
            const eventName = el.getAttribute('data-track');
            trackEvent(eventName, { 
                button_text: el.innerText.trim() || el.value || 'N/A',
                destination_url: el.href || 'N/A',
                page_path: window.location.pathname
            });
        });
    });
});
