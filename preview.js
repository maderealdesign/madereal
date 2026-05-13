exports.handler = async function(event) {
    // 1. Extract the slug from the URL path safely
    let rawPath = event.path || "";
    
    // Clean up the path whether it's accessed directly or via the redirect
    let slug = rawPath.replace(/^\/+/g, '') // remove leading slashes
                      .replace('.netlify/functions/preview', '') // remove function base path if present
                      .replace(/^\/+/g, ''); // remove any remaining leading slashes
    
    // Fallback if someone hits the root via the function
    if (!slug) {
        return { statusCode: 301, headers: { Location: "/" }, body: "" };
    }

    // 2. Access your Firebase Project ID from Netlify Environment Variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (!projectId) {
        return { 
            statusCode: 500, 
            body: "Server Configuration Error: FIREBASE_PROJECT_ID is not set in Netlify." 
        };
    }

    // 3. Query the Firestore REST API (Using the slug as the Document ID)
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/previews/${slug}`;

    try {
        const response = await fetch(url);
        
        // If document doesn't exist, return our custom 404
        if (!response.ok) {
            return {
                statusCode: 404,
                headers: { "Content-Type": "text/html" },
                body: `
                    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1 style="font-weight: 900; font-size: 2rem; margin-bottom: 10px;">404 - Preview Not Found</h1>
                        <p style="color: #666;">The site preview for <strong>/${slug}</strong> does not exist or has been removed.</p>
                        <a href="/" style="display: inline-block; margin-top: 20px; color: #00D2A0; font-weight: bold; text-decoration: none;">&larr; Return to MadeReal</a>
                    </div>
                `
            };
        }

        const data = await response.json();
        
        // 4. Extract the HTML string from the Firestore REST response format
        const htmlContent = data.fields.html.stringValue;

        // 5. Serve the HTML directly to the browser
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html; charset=UTF-8",
                "Cache-Control": "no-cache, no-store, must-revalidate"
            },
            body: htmlContent
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: "Internal Server Error while fetching preview: " + error.message
        };
    }
};