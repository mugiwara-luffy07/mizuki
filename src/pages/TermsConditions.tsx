import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsConditions() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Terms & Conditions</h1>

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
                Welcome to Mizuki, a brand owned and operated by Aadharsh International. These Terms & Conditions govern your use of our services, including the purchase of readymade and customized clothing. By accessing or purchasing from Mizuki, you agree to comply with these terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Products & Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <div>
                <h4 className="font-semibold mb-2">a. Readymade Clothing</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Products are sold as displayed, subject to availability.</li>
                  <li>We strive to ensure product descriptions and images are accurate; however, slight variations in color, fabric, or design may occur.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">b. Customized Clothing</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Customers must provide accurate measurements and specifications.</li>
                  <li>Once confirmed, customization orders cannot be modified or canceled.</li>
                  <li>Mizuki is not responsible for fitting issues arising from incorrect measurements provided by the customer.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pricing & Payments</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>All prices are listed in INR unless stated otherwise.</li>
                <li>Prices are subject to change without prior notice.</li>
                <li>Full or partial payment may be required before order processing.</li>
                <li>Payments must be made through approved payment methods.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Order Acceptance & Cancellation</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Orders are confirmed only after successful payment.</p>
              <p className="mt-2">Mizuki reserves the right to refuse or cancel any order due to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Product unavailability</li>
                <li>Pricing errors</li>
                <li>Suspicious or fraudulent transactions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Shipping & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Delivery timelines are estimates and may vary based on location and order type.</li>
                <li>Customized orders may take longer than readymade products.</li>
                <li>Mizuki is not liable for delays caused by logistics partners or unforeseen circumstances.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Returns & Refunds</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <div>
                <h4 className="font-semibold mb-2">a. Readymade Products</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Returns may be accepted within specified days of delivery.</li>
                  <li>Items must be unused, unwashed, and in original condition with tags.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">b. Customized Products</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Customized items are non-returnable and non-refundable, except in cases of manufacturing defects.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">c. Refund Processing</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Approved refunds will be processed within a reasonable timeframe via the original payment method.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                All content, designs, logos, and materials associated with Mizuki are the property of Aadharsh International and are protected by applicable intellectual property laws. Unauthorized use is prohibited.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>By using our services, you agree to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Not misuse or attempt to disrupt our services</li>
                <li>Not engage in fraudulent or illegal activities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Mizuki shall not be held liable for:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Indirect or consequential damages</li>
                <li>Losses arising from misuse of products</li>
                <li>Minor variations in customized or readymade items</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Warranty Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                All products are provided "as is" without warranties of any kind, unless otherwise specified.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                You agree to indemnify and hold harmless Mizuki and Aadharsh International from any claims, damages, or losses arising from your breach of these Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Mizuki reserves the right to update or modify these Terms & Conditions at any time without prior notice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">For any questions or concerns regarding these Terms & Conditions, please contact:</p>
              <div className="text-sm space-y-1">
                <p><strong>Mizuki (A Unit of Aadharsh International)</strong></p>
                <p>Email: <a href="mailto:mizukibeautifulmoon123@gmail.com" className="text-primary hover:underline">mizukibeautifulmoon123@gmail.com</a></p>
                <p>WhatsApp/Call: <a href="tel:+919942322743" className="text-primary hover:underline">+91 9942322743</a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}













