import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeliveryPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Delivery Policy</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mizuki Brand - A Unit of Aadharsh Textiles</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Effective Date: 31-03-2026</p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Overview</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                At Mizuki, we are committed to delivering high-quality clothing products in a timely and efficient manner. This Delivery Policy outlines the timelines, processes, and conditions applicable to both ready-made and customized clothing orders placed through our online platforms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Delivery Categories</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <div>
                <h4 className="font-semibold mb-2">a. Ready-Made Clothing</h4>
                <p>
                  Includes pre-designed and pre-stitched garments available for immediate dispatch.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">b. Customized Clothing</h4>
                <p>
                  Includes made-to-order garments such as blouses, chudithars, lehengas, and other custom apparel tailored to customer specifications.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Delivery Timelines</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <div>
                <h4 className="font-semibold mb-2">a. Ready-Made Clothing</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Orders are processed within 2-5 business days.</li>
                  <li>Estimated delivery timelines:</li>
                  <li>Within Tamil Nadu: 2-5 business days</li>
                  <li>Other states in India: 3-7 business days</li>
                  <li>Remote/non-metro locations: 5-10 business days</li>
                  <li>Delivery timelines may vary based on courier service availability and location accessibility.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">b. Customized Clothing</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Production time depends on design complexity and customization requirements.</li>
                  <li>Estimated timelines:</li>
                  <li>Production time: 5-15 business days</li>
                  <li>Shipping within Tamil Nadu: 3-5 business days</li>
                  <li>Shipping to other states: 3-9 business days</li>
                  <li>Total delivery timeline: 5-20 business days (approx.).</li>
                  <li>Customers will be informed of specific timelines during order confirmation.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Order Processing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Orders are processed only after successful payment confirmation.</li>
                <li>Customized orders require complete design details, measurements, and approvals before production begins.</li>
                <li>Any delay in providing required details may impact delivery timelines.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Shipping Charges</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Shipping charges, if applicable, will be calculated after checkout based on delivery location and order value (extra charges may apply).</li>
                <li>Free shipping offers (if any) will be clearly communicated on the website or promotional materials.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Tracking of Orders</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Once the order is dispatched, customers will receive a tracking ID/link via email or SMS.</li>
                <li>Customers can track their shipment in real-time through the courier partner's website.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Delays & Exceptions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>While we strive to meet delivery timelines, delays may occur due to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Natural calamities or unforeseen circumstances</li>
                <li>Courier service disruptions</li>
                <li>High seasonal demand or festive periods</li>
                <li>Incomplete customer information</li>
              </ul>
              <p>
                Mizuki will not be held liable for delays caused by external factors but will ensure proactive communication.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Delivery Attempts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Our courier partners will attempt delivery 2-3 times.</li>
                <li>If delivery fails due to customer unavailability or incorrect address, the package may be returned to us.</li>
                <li>Re-dispatch charges may apply.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Address Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Customers are responsible for providing accurate and complete delivery details. Mizuki is not responsible for delays or losses due to incorrect address information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. International Shipping (If Applicable)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Delivery timelines and charges will vary based on destination country.</li>
                <li>Customs duties, taxes, and import charges (if any) are to be borne by the customer.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">For delivery-related queries or support, please contact:</p>
              <div className="text-sm space-y-1">
                <p><strong>Mizuki (A Unit of Aadharsh International)</strong></p>
                <p>Email: <a href="mailto:mizukibeautifulmoon123@gmail.com" className="text-primary hover:underline">mizukibeautifulmoon123@gmail.com</a></p>
                <p>WhatsApp/Call: <a href="tel:+919942322743" className="text-primary hover:underline">+91 9942322743</a></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                Mizuki reserves the right to update or modify this Delivery Policy at any time without prior notice. Customers are advised to review this policy periodically.
              </p>
              <p className="text-sm italic">
                By placing an order with Mizuki, you agree to the terms outlined in this Delivery Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
