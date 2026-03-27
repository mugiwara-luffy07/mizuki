import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Refund & Cancellation Policy</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mizuki (A Unit of Aadharsh International)</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Effective Date: 25-03-2026</p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                This Refund & Cancellation Policy outlines the terms under which Mizuki, a brand owned and operated by Aadharsh International, processes refunds and cancellations for both readymade and customized clothing.
              </p>
              <p className="mt-4">
                By placing an order with Mizuki, you agree to the terms stated in this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>Refund requests must be raised within 24 hours of placing the order.</li>
                <li>Refund eligibility is subject to verification and approval by Mizuki.</li>
                <li>The decision of the company regarding refunds shall be final and binding.</li>
              </ul>
              
              <div>
                <h4 className="font-semibold mb-2">Refund Conditions</h4>
                <p>Refunds may be considered under the following circumstances:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Order placed but not yet processed or dispatched</li>
                  <li>Duplicate payment or transaction errors</li>
                  <li>Other exceptional cases as determined by Mizuki</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Non-Refundable Cases</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Requests made after 24 hours of placing the order</li>
                  <li>Customized clothing orders once production has begun</li>
                  <li>Minor variations in color, design, or fabric</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>Cancellation of orders is allowed only under the following conditions:</p>
              
              <div>
                <h4 className="font-semibold mb-2">a. Unavailability of Fabric or Design</h4>
                <p>
                  Orders may be cancelled only if the selected fabric or design is not available at any cost or from any source to Mizuki.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">b. Product Issue After Delivery</h4>
                <p>If the delivered product does not match the confirmed order details:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mizuki will arrange a replacement.</li>
                  <li>If the issue persists even after the second delivery attempt, the order will be eligible for cancellation.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Replacement Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Replacement requests must be raised within specified days of delivery.</li>
                <li>Products must be unused, unwashed, and in original condition with tags intact.</li>
                <li>Customized products are eligible for replacement only in case of manufacturing defects or incorrect fulfillment.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Refund Processing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Approved refunds will be processed within a reasonable timeframe.</li>
                <li>Refunds will be credited via the original payment method unless otherwise agreed.</li>
                <li>Processing time may vary depending on the payment provider.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Mizuki reserves the right to inspect returned or disputed products before approving refunds or cancellations.</li>
                <li>Shipping charges (if any) may be non-refundable unless the issue is caused by Mizuki.</li>
                <li>This policy is subject to change without prior notice.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">For any questions or concerns regarding this Refund & Cancellation Policy, please contact:</p>
              <div className="text-sm space-y-1">
                <p><strong>Mizuki (A Unit of Aadharsh International)</strong></p>
                <p>Email: <a href="mailto:mizukibeautifulmoon123@gmail.com" className="text-primary hover:underline">mizukibeautifulmoon123@gmail.com</a></p>
                <p>WhatsApp/Call: <a href="tel:+919942322743" className="text-primary hover:underline">+91 9942322743</a></p>
              </div>
              <p className="mt-4 text-sm italic">
                By placing an order, you acknowledge that you have read, understood, and agreed to this Refund & Cancellation Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}













