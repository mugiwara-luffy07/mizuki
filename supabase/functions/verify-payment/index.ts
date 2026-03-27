    // @ts-nocheck
    import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    interface VerifyPaymentBody {
    order_id: string;
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
        const { order_id } = (await req.json()) as VerifyPaymentBody;

        if (!order_id) {
        return jsonResponse({ error: "order_id is required" }, 400);
        }

        const clientId = Deno.env.get("CASHFREE_APP_ID");
        const clientSecret = Deno.env.get("CASHFREE_SECRET_KEY");
        const env = (Deno.env.get("CASHFREE_ENV") || "sandbox").toLowerCase();

        if (!clientId || !clientSecret) {
        return jsonResponse({ error: "Cashfree keys are missing" }, 500);
        }

        const cashfreeBaseUrl =
        env === "production"
            ? "https://api.cashfree.com/pg"
            : "https://sandbox.cashfree.com/pg";

        const response = await fetch(`${cashfreeBaseUrl}/orders/${order_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-api-version": "2023-08-01",
            "x-client-id": clientId,
            "x-client-secret": clientSecret,
        },
        });

        const result = await response.json();

        if (!response.ok) {
        return jsonResponse({ error: "Cashfree verification failed", details: result }, 400);
        }

        const isPaid = result.order_status === "PAID";

        return jsonResponse({
        success: isPaid,
        order_status: result.order_status,
        cashfree_order_id: result.order_id,
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
