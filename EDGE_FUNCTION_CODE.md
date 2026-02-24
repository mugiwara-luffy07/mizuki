    # Supabase Edge Function: send-order-email

    **Location**: Create in Supabase Dashboard → Edge Functions → Create new function → `send-order-email`

    **Copy this code into the function:**

    ```typescript
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    serve(async (req) => {
      if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
      }

      try {
        const body = await req.json()
        const { order_id, email, event_type } = body

        console.log('📥 Received:', { order_id, email, event_type })

        if (!order_id || !email || !event_type) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Fetch order from Supabase using REST API
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseKey) {
          console.error('❌ Missing Supabase config')
          return new Response(
            JSON.stringify({ error: 'Supabase config missing' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('🔍 Fetching order:', order_id)

        const orderRes = await fetch(
          `${supabaseUrl}/rest/v1/ecommerce_orders?id=eq.${order_id}&select=*`,
          {
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
            },
          }
        )

        const orders = await orderRes.json()

        if (!orders || orders.length === 0) {
          console.error('❌ Order not found:', order_id)
          return new Response(
            JSON.stringify({ error: 'Order not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const order = orders[0]
        console.log('✅ Order fetched:', { order_number: order.order_number, total: order.total })

        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        if (!RESEND_API_KEY) {
          console.error('❌ RESEND_API_KEY missing')
          return new Response(
            JSON.stringify({ error: 'RESEND_API_KEY not set' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        let subject = ''
        let htmlContent = ''

        if (event_type === 'ORDER_PLACED') {
          subject = 'Order Placed – Payment Verification Pending'
          htmlContent = `<h2>Order Received</h2><p>Order ID: ${order.order_number}</p><p>Total: ₹${order.total}</p>`
        } else if (event_type === 'PAYMENT_VERIFIED') {
          subject = 'Payment Verified – Order Confirmed'
          htmlContent = `<h2>Payment Confirmed!</h2><p>Order ID: ${order.order_number}</p>`
        } else if (event_type === 'ORDER_PACKED') {
          subject = 'Your Order Has Been Packed'
          htmlContent = `<h2>Order Packed</h2><p>Order ID: ${order.order_number}</p>`
        } else if (event_type === 'ORDER_SHIPPED') {
          subject = 'Your Order Is On The Way'
          htmlContent = `<h2>Order Shipped!</h2><p>Order ID: ${order.order_number}</p>`
        } else if (event_type === 'ORDER_DELIVERED') {
          subject = 'Order Delivered'
          htmlContent = `<h2>Order Delivered!</h2><p>Order ID: ${order.order_number}</p>`
        } else {
          return new Response(
            JSON.stringify({ error: 'Invalid event_type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('📧 Sending email:', { subject, to: email })

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Mizuki <onboarding@resend.dev>',
            to: email,
            subject: subject,
            html: htmlContent,
          }),
        })

        const result = await emailRes.json()
        console.log('📨 Resend response:', emailRes.status, result)

        if (!emailRes.ok) {
          console.error('❌ Resend error:', result)
          return new Response(
            JSON.stringify({ error: 'Email send failed', details: result }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('✅ Email sent successfully')

        return new Response(
          JSON.stringify({ success: true, messageId: result.id }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    })
    ```
          return new Response(
            JSON.stringify({ error: 'Missing email or event_type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const template = emailTemplates[event_type]
        if (!template) {
          return new Response(
            JSON.stringify({ error: 'Invalid event_type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const emailHtml = template.template({ order_number, total, tracking_id })

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: email,
            subject: template.subject,
            html: emailHtml,
          }),
        })

        const responseData = await resendResponse.json()

        if (!resendResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Resend failed', status: resendResponse.status, data: responseData }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, messageId: responseData.id }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    })
    ```
    ```

    ---

    ## Setup Instructions:

    1. **Create Edge Function in Supabase Dashboard:**
    - Go to Supabase Project → Edge Functions
    - Click "Create a new function"
    - Name: `send-order-email`
    - Paste the code above
    - Deploy

    2. **Add Resend API Key:**
    - Get API key from https://resend.com
    - In Supabase dashboard → Project Settings → Edge Functions → Secrets
    - Add secret: `RESEND_API_KEY` = `your_resend_key_here`

    3. **Update sender email:**
    - Replace `orders@mizuki.in` with your actual sender email
    - Update WhatsApp number in templates
    - Update support email address

    4. **Test:**
    - Try updating payment status in admin
    - Should receive email at customer email address
