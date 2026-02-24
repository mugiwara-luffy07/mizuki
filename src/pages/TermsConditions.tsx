import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsConditions() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Terms & Conditions</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Last Updated: {new Date().toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              Please read these Terms and Conditions carefully before using our e-commerce platform.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                By accessing and using this website, you accept and agree to be bound by these 
                Terms and Conditions. If you do not agree, please do not use our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Account Registration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Product Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>We strive to provide accurate product descriptions and images</li>
                <li>Minor color variations may occur due to photography or device settings</li>
                <li>Product prices are subject to change without notice</li>
                <li>We reserve the right to correct pricing errors</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Orders and Payment</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>All orders are subject to product availability</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Payment must be completed before order processing</li>
                <li>Prices are inclusive of applicable taxes</li>
                <li>Shipping costs are calculated at checkout</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Shipping and Delivery</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Domestic delivery: 5 business days</li>
                <li>International delivery: 7–9 business days</li>
                <li>Order processing: Within 2 business days</li>
                <li>Customer responsible for customs duties/taxes on international orders</li>
                <li>Remote Area Surcharge (RAS) may apply and will be communicated before shipping</li>
                <li>Seller not responsible for customs delays</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Returns and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Please refer to our Refund Policy for detailed information about returns and refunds.
                Returns are generally not available except for admin-side issues.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                All content on this website, including text, images, logos, and designs, is the 
                property of the company and protected by copyright and trademark laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We are not liable for any indirect, incidental, or consequential damages arising 
                from the use of our website or products.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                For questions about these Terms & Conditions, contact us at{' '}
                <a href="mailto:enquiry@asfffdf.com" className="text-primary hover:underline">
                  enquiry@asfffdf.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}













