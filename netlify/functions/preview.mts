declare const Netlify: {
    env: {
        get(name: string): string | undefined;
    };
};

const RESERVED_SLUGS = new Set([
    "admin",
    "about",
    "blog",
    "contact",
    "case-studies",
    "faq",
    "get-started",
    "graphic-design",
    "pay-monthly-checkout",
    "pay-monthly-success",
    "pay-monthly-websites",
    "printing",
    "privacy",
    "terms",
    "web-design-barnoldswick",
    "web-design-blackburn",
    "web-design-burnley",
    "web-design-clitheroe",
    "web-design-colne",
    "web-design-nelson",
    "web-design-pendle",
    "web-design-skipton",
]);

function getPreviewSlug(req: Request) {
    const { pathname } = new URL(req.url);
    return pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
}

function notFound(slug: string) {
    return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Preview Not Found | MadeReal</title>
</head>
<body style="font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: white; color: #0f172a;">
    <h1 style="font-weight: 900; font-size: 2rem; margin-bottom: 10px;">404 - Preview Not Found</h1>
    <p style="color: #666;">The site preview for <strong>/${slug}</strong> does not exist or has been removed.</p>
    <a href="/" style="display: inline-block; margin-top: 20px; color: #00a982; font-weight: 800; text-decoration: none;">&larr; Return to MadeReal</a>
</body>
</html>`,
        {
            status: 404,
            headers: {
                "Content-Type": "text/html; charset=UTF-8",
                "X-Robots-Tag": "noindex, nofollow",
            },
        },
    );
}

export default async (req: Request) => {
    const slug = getPreviewSlug(req);

    if (!slug || slug.includes("/") || slug.includes(".") || RESERVED_SLUGS.has(slug)) {
        return notFound(slug || "preview");
    }

    const projectId = Netlify.env.get("FIREBASE_PROJECT_ID") || "maderealwebsites";
    if (!projectId) {
        return new Response("Server configuration error: FIREBASE_PROJECT_ID is not set in Netlify.", {
            status: 500,
            headers: {
                "Content-Type": "text/plain; charset=UTF-8",
                "X-Robots-Tag": "noindex, nofollow",
            },
        });
    }

    const endpoint = new URL(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/previews/${encodeURIComponent(slug)}`,
    );
    const apiKey = Netlify.env.get("FIREBASE_WEB_API_KEY");
    if (apiKey) endpoint.searchParams.set("key", apiKey);

    try {
        const response = await fetch(endpoint);

        if (response.status === 404) {
            return notFound(slug);
        }

        if (!response.ok) {
            const details = await response.text();
            return new Response(`Error loading preview: Firestore returned ${response.status}. ${details}`, {
                status: 502,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8",
                    "X-Robots-Tag": "noindex, nofollow",
                },
            });
        }

        const data = await response.json();
        const html = data?.fields?.html?.stringValue;

        if (!html) {
            return notFound(slug);
        }

        return new Response(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=UTF-8",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "X-Robots-Tag": "noindex, nofollow",
            },
        });
    } catch (error) {
        return new Response(`Internal server error while fetching preview: ${(error as Error).message}`, {
            status: 500,
            headers: {
                "Content-Type": "text/plain; charset=UTF-8",
                "X-Robots-Tag": "noindex, nofollow",
            },
        });
    }
};

export const config = {
    path: "/:slug",
    preferStatic: true,
    excludedPath: [
        "/admin",
        "/admin.html",
        "/about",
        "/about.html",
        "/blog",
        "/blog.html",
        "/case-studies",
        "/case-studies.html",
        "/contact",
        "/contact.html",
        "/faq",
        "/faq.html",
        "/get-started",
        "/get-started.html",
        "/graphic-design",
        "/graphic-design.html",
        "/pay-monthly-checkout",
        "/pay-monthly-checkout.html",
        "/pay-monthly-success",
        "/pay-monthly-success.html",
        "/pay-monthly-websites",
        "/pay-monthly-websites.html",
        "/printing",
        "/printing.html",
        "/privacy",
        "/privacy.html",
        "/terms",
        "/terms.html",
        "/web-design-barnoldswick",
        "/web-design-barnoldswick.html",
        "/web-design-blackburn",
        "/web-design-blackburn.html",
        "/web-design-burnley",
        "/web-design-burnley.html",
        "/web-design-clitheroe",
        "/web-design-clitheroe.html",
        "/web-design-colne",
        "/web-design-colne.html",
        "/web-design-nelson",
        "/web-design-nelson.html",
        "/web-design-pendle",
        "/web-design-pendle.html",
        "/web-design-skipton",
        "/web-design-skipton.html",
    ],
};
