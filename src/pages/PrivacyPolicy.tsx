import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Privacy Policy</h1>

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
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>
                Mizuki ("we," "our," or "us"), a brand owned and operated by Aadharsh International, values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit, interact with, or make purchases from Mizuki, including both readymade and customized clothing services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <div>
                <h4 className="font-semibold mb-2">a. Personal Information</h4>
                <p>We may collect the following personal details:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Name</li>
                  <li>Phone number</li>
                  <li>Email address</li>
                  <li>Billing and shipping address</li>
                  <li>Payment information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">b. Order & Customization Details</h4>
                <p>For customized clothing, we may collect:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Measurements</li>
                  <li>Design preferences</li>
                  <li>Fabric choices</li>
                  <li>Style specifications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">c. Automatically Collected Information</h4>
                <p>When you interact with us (website/social media), we may collect:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>IP address</li>
                  <li>Device type</li>
                  <li>Browser type</li>
                  <li>Usage data (pages visited, time spent)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Process and fulfill orders</li>
                <li>Provide customized clothing services</li>
                <li>Communicate order updates and customer support</li>
                <li>Improve our products and services</li>
                <li>Send promotional offers (only with your consent)</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Sharing of Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>We do not sell your personal information. However, we may share it with:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Payment gateways for transaction processing</li>
                <li>Delivery/logistics partners for order fulfillment</li>
                <li>Service providers assisting in business operations</li>
                <li>Legal authorities if required by law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, misuse, or disclosure. However, no method of transmission over the internet is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>We retain your information only as long as necessary for:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Fulfilling orders</li>
                <li>Legal and accounting requirements</li>
                <li>Customer service purposes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us using the details below.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies & Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Third-Party Links</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Our platforms may contain links to third-party websites. We are not responsible for the privacy practices of those websites.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Mizuki does not knowingly collect personal data from individuals under the age of 18 without parental consent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We reserve the right to update this Privacy Policy at any time. Updates will be posted with a revised effective date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">For any questions or concerns regarding this Privacy Policy, please contact:</p>
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













