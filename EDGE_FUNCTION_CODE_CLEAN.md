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

// Professional HTML Email Templates
function generateEmailHTML(eventType: string, order: any): string {
  const baseHTML = (title: string, subtitle: string, content: string, ctaText: string, ctaUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #0d7377 0%, #14919b 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Mizuki Styles</h1>
              <p style="margin: 8px 0 0 0; color: #d4af37; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Premium Fashion</p>
            </td>
          </tr>

          <!-- Title Section -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                ${title}
              </h2>
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${subtitle}
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 0 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                          <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Order Number</p>
                          <p style="margin: 6px 0 0 0; color: #1a1a1a; font-size: 18px; font-weight: 700;">${order.order_number}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                          <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Order Date</p>
                          <p style="margin: 6px 0 0 0; color: #1a1a1a; font-size: 14px;">${new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                          <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Order Total</p>
                          <p style="margin: 6px 0 0 0; color: #d4af37; font-size: 20px; font-weight: 700;">₹${order.total.toLocaleString('en-IN')}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Status</p>
                          <p style="margin: 6px 0 0 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 30px;">
              ${content}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="${ctaUrl}" style="display: inline-block; padding: 14px 40px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 4px; border: 2px solid #1a1a1a; transition: all 0.3s ease;">
                ${ctaText}
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e5e5;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #ffffff; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">Mizuki Styles</p>
              <p style="margin: 0 0 8px 0; color: #666666; font-size: 12px;">
                <a href="mailto:orders@mizukistyles.com" style="color: #d4af37; text-decoration: none; font-weight: 500;">orders@mizukistyles.com</a>
              </p>
              <p style="margin: 0 0 16px 0; color: #666666; font-size: 12px;">
                Mizuki Styles | India
              </p>
              <p style="margin: 0; color: #999999; font-size: 11px; line-height: 1.6;">
                © 2026 Mizuki Styles. All rights reserved.<br>
                This is a transactional email. Please do not reply to this address.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const baseURL = 'https://mizukistyles.com'

  if (eventType === 'ORDER_PLACED') {
    return baseHTML(
      'Order Placed Successfully',
      'Thank you for your order! We\'ve received it and will process your payment verification shortly.',
      `
        <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.8;">
          Your order has been placed successfully. We're now awaiting payment verification to proceed with packing your items.
        </p>
        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.8;">
          <strong style="color: #1a1a1a;">Next step:</strong> Please complete the payment verification process in your order details.
        </p>
        <div style="margin-top:16px;">
          <p style="margin:0; font-weight:600;">🚚 Delivery Information:</p>
          <p style="margin:4px 0 0 0; color:#555; font-size:14px; line-height:1.5;">
            Shipping charges will be calculated based on your delivery location and order weight.
            Our team will connect with you shortly to confirm the details.
          </p>
        </div>
      `,
      'View Order Details',
      `${baseURL}/orders`
    )
  }

  if (eventType === 'PAYMENT_VERIFIED') {
    return baseHTML(
      'Payment Verified ✓',
      'Your payment has been confirmed. Your order is now being prepared for shipment.',
      `
        <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.8;">
          Excellent! Your payment has been verified successfully. Our team is now preparing your items for dispatch.
        </p>
        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.8;">
          <strong style="color: #1a1a1a;">What's next:</strong> You'll receive a shipping notification as soon as your order leaves our warehouse.
        </p>
      `,
      'Track Order',
      `${baseURL}/orders`
    )
  }

  if (eventType === 'ORDER_PACKED') {
    return baseHTML(
      'Order Packed & Ready',
      'Your order has been carefully packed and is ready for shipment.',
      `
        <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.8;">
          Great news! Your order has been packed with care and is ready to ship out. A tracking number will be provided shortly.
        </p>
        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.8;">
          <strong style="color: #1a1a1a;">Ready to ship:</strong> Your package is on its way to you!
        </p>
      `,
      'View Tracking',
      `${baseURL}/orders`
    )
  }

  if (eventType === 'ORDER_SHIPPED') {
    return baseHTML(
      'Order Shipped!',
      'Your order is on the way! You can now track your shipment in real-time.',
      `
        <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.8;">
          Your package is on its way to you! It will arrive within 3-5 business days depending on your location.
        </p>
        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.8;">
          <strong style="color: #1a1a1a;">Track your shipment:</strong> Click the button below to view real-time tracking updates.
        </p>
      `,
      'Track Shipment',
      `${baseURL}/orders`
    )
  }

  if (eventType === 'ORDER_DELIVERED') {
    return baseHTML(
      'Order Delivered ✓',
      'Your order has been delivered successfully! We hope you love your purchase.',
      `
        <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.8;">
          Your order has been delivered to your doorstep. We hope you're delighted with your purchase!
        </p>
        <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.8;">
          <strong style="color: #1a1a1a;">Share your experience:</strong> We'd love to hear your feedback. Your review helps us improve.
        </p>
        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.8;">
          Thank you for shopping with Mizuki Styles! 🎉
        </p>
      `,
      'Write a Review',
      `${baseURL}/orders`
    )
  }

  return baseHTML('Order Update', 'Your order status has been updated.', '', 'View Order', `${baseURL}/orders`)
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

    // Generate professional HTML email
    const htmlContent = generateEmailHTML(event_type, order)
    
    let subject = ''
    if (event_type === 'ORDER_PLACED') {
      subject = 'Order Placed Successfully – Payment Verification Pending'
    } else if (event_type === 'PAYMENT_VERIFIED') {
      subject = 'Payment Verified ✓ – Your Order is Being Prepared'
    } else if (event_type === 'ORDER_PACKED') {
      subject = 'Order Packed & Ready – Shipping Soon'
    } else if (event_type === 'ORDER_SHIPPED') {
      subject = 'Order Shipped! – Track Your Package'
    } else if (event_type === 'ORDER_DELIVERED') {
      subject = 'Order Delivered ✓ – Thank You for Your Purchase'
    }

    console.log('📧 Sending email:', { subject, to: email, event_type })

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Mizuki Styles <orders@mizukistyles.com>',
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

---

## Setup Instructions:

1. **Go to Supabase Dashboard → Edge Functions → send-order-email → Code**
2. **Delete ALL existing code**
3. **Paste the code above**
4. **Click Deploy**

**Required Secrets** (Project Settings → Edge Functions → Secrets):
- `RESEND_API_KEY` = your Resend API key
- `SUPABASE_URL` = your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` = your Service Role key
