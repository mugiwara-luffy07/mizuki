    // @ts-nocheck
    import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    interface CreatePaymentOrderBody {
    amount: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    tenant?: string;
    }

    function handleOptionsRequest() {
    return new Response("ok", {
            headers: corsHeaders,
    });
    }

    function jsonResponse(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        },
    });
    }

    serve(async (req) => {
    if (req.method === "OPTIONS") {
        return handleOptionsRequest();
    }

    try {
        const {
        amount,
        customer_name,
        customer_email,
        customer_phone,
        tenant = "mizuki",
        } = (await req.json()) as CreatePaymentOrderBody;

        if (!amount || amount <= 0) {
        return jsonResponse({ error: "Invalid amount" }, 400);
        }

        if (!customer_name || !customer_email || !customer_phone) {
        return jsonResponse({ error: "Missing customer details" }, 400);
        }

        // Keep Cashfree credentials only in Edge Function secrets.
        const clientId = Deno.env.get("CASHFREE_APP_ID");
        const clientSecret = Deno.env.get("CASHFREE_SECRET_KEY");
        const env = (Deno.env.get("CASHFREE_ENV") || "sandbox").toLowerCase();
        const frontendBaseUrl = Deno.env.get("FRONTEND_BASE_URL");

        if (!clientId || !clientSecret) {
        return jsonResponse({ error: "Cashfree keys are missing" }, 500);
        }

        if (!frontendBaseUrl) {
        return jsonResponse({ error: "FRONTEND_BASE_URL is missing" }, 500);
        }

        const cashfreeBaseUrl =
        env === "production"
            ? "https://api.cashfree.com/pg"
            : "https://sandbox.cashfree.com/pg";

        const orderId = `CF_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        const response = await fetch(`${cashfreeBaseUrl}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-version": "2023-08-01",
            "x-client-id": clientId,
            "x-client-secret": clientSecret,
        },
        body: JSON.stringify({
            order_id: orderId,
            order_amount: Number(amount.toFixed(2)),
            order_currency: "INR",
            customer_details: {
            customer_id: `CUST_${Date.now()}`,
            customer_name,
            customer_email,
            customer_phone,
            },
            order_meta: {
            return_url: `${frontendBaseUrl}/${tenant}/payment-success?order_id={order_id}`,
            },
        }),
        });

        const result = await response.json();

        if (!response.ok) {
        return jsonResponse({ error: "Cashfree order creation failed", details: result }, 400);
        }

        return jsonResponse({
        order_id: result.order_id,
        payment_session_id: result.payment_session_id,
        });
    } catch (error) {
        return jsonResponse(
        {
            error: error instanceof Error ? error.message : "Unexpected error",
        },
        500
        );
    }
    });
