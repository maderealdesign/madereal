import Stripe from "stripe";

declare const Netlify: {
    env: {
        get(name: string): string | undefined;
    };
};

declare const process: {
    env: Record<string, string | undefined>;
};

const stripeApiVersion = "2026-02-25.clover";

function getEnv(name: string) {
    if (typeof Netlify !== "undefined" && Netlify.env) {
        return Netlify.env.get(name) || process.env[name] || "";
    }

    return process.env[name] || "";
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "no-store",
        },
    });
}

async function readPayload(req: Request) {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await req.json();
    }

    const formData = await req.formData();
    return Object.fromEntries(formData.entries());
}

function clean(value: unknown, fallback = "") {
    return String(value || fallback).trim().slice(0, 500);
}

export default async (req: Request) => {
    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const secretKey = getEnv("STRIPE_SECRET_KEY");
    const priceId = getEnv("STRIPE_PAY_MONTHLY_PRICE_ID");

    if (!secretKey || !priceId) {
        return jsonResponse({
            error: "Stripe checkout is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PAY_MONTHLY_PRICE_ID in Netlify.",
        }, 500);
    }

    const payload = await readPayload(req);
    const requestUrl = new URL(req.url);
    const origin = requestUrl.origin;
    const successUrl = getEnv("STRIPE_PAY_MONTHLY_SUCCESS_URL") || `${origin}/pay-monthly-success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = getEnv("STRIPE_PAY_MONTHLY_CANCEL_URL") || `${origin}/pay-monthly-checkout.html?status=cancelled`;
    const trialDays = Number.parseInt(getEnv("STRIPE_PAY_MONTHLY_TRIAL_DAYS"), 10);

    const clientName = clean(payload.Client_Name || payload.client_name);
    const clientEmail = clean(payload.Client_Email || payload.client_email);
    const businessName = clean(payload.Business_Name || payload.business_name, "Pay monthly website");
    const businessTown = clean(payload.Business_Town || payload.business_town);

    if (!clientEmail || !businessName || !businessTown) {
        return jsonResponse({ error: "Please add your email, business name and town before checkout." }, 400);
    }

    const stripe = new Stripe(secretKey, {
        apiVersion: stripeApiVersion as Stripe.LatestApiVersion,
    });

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer_email: clientEmail,
            client_reference_id: `${businessName} - ${businessTown}`.slice(0, 200),
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                metadata: {
                    client_name: clientName,
                    business_name: businessName,
                    business_town: businessTown,
                    client_phone: clean(payload.Client_Phone || payload.client_phone),
                    existing_link: clean(payload.Existing_Link || payload.existing_link),
                    source_page: clean(payload.Source_Page || "Pay Monthly Checkout"),
                },
                ...(Number.isFinite(trialDays) && trialDays > 0 ? { trial_period_days: trialDays } : {}),
            },
            metadata: {
                client_name: clientName,
                business_name: businessName,
                business_town: businessTown,
                business_notes: clean(payload.Business_Notes || payload.business_notes),
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: false,
            billing_address_collection: "auto",
        });

        return jsonResponse({ url: session.url });
    } catch (error) {
        return jsonResponse({
            error: error instanceof Error ? error.message : "Unable to create Stripe checkout session.",
        }, 500);
    }
};
