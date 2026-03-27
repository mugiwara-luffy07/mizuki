import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DisclaimerPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Disclaimer Policy</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mizuki (A Unit of Aadharsh International)</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Effective Date: 25-03-2026</p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. General Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Mizuki, a brand owned and operated by Aadharsh International, makes every effort to ensure that all information, products, and services provided are accurate and reliable. However, we make no guarantees, representations, or warranties of any kind, express or implied, regarding the completeness, accuracy, or reliability of any information or products.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Product Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <div>
                <h4 className="font-semibold mb-2">a. Readymade Clothing</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Product images are for representation purposes only.</li>
                  <li>Actual colors, textures, and finishes may vary slightly due to lighting, screen settings, and manufacturing differences.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">b. Customized Clothing</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Final products are created based on customer-provided specifications and preferences.</li>
                  <li>Minor variations in stitching, color, fabric availability, or design execution may occur.</li>
                  <li>Mizuki is not responsible for issues arising from incorrect measurements or unclear instructions provided by the customer.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Fit & Measurement Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Customers are solely responsible for providing accurate measurements.</li>
                <li>Mizuki does not guarantee perfect fit for customized clothing due to individual body variations.</li>
                <li>Alterations, if required, are the responsibility of the customer unless otherwise agreed.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Availability Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                All products, fabrics, and designs are subject to availability. Mizuki reserves the right to substitute or modify materials if exact options are unavailable, with prior customer communication where possible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. External Factors</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Mizuki shall not be held responsible for delays or failure in performance due to circumstances beyond our control, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Supply chain disruptions</li>
                <li>Transportation or logistics delays</li>
                <li>Natural disasters or unforeseen events</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>To the fullest extent permitted by law:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Mizuki shall not be liable for any indirect, incidental, or consequential damages.</li>
                <li>Liability, if any, shall be limited to the value of the purchased product.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We may use third-party services such as payment gateways and logistics providers. Mizuki is not responsible for the performance, errors, or policies of these third parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. No Professional Advice</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Any suggestions or recommendations provided by Mizuki regarding styling, fabrics, or designs are for general guidance only and do not constitute professional advice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Mizuki reserves the right to update or modify this Disclaimer Policy at any time without prior notice. Changes will be effective immediately upon posting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">For any questions or concerns regarding this Disclaimer Policy, please contact:</p>
              <div className="text-sm space-y-1">
                <p><strong>Mizuki (A Unit of Aadharsh International)</strong></p>
                <p>Email: <a href="mailto:mizukibeautifulmoon123@gmail.com" className="text-primary hover:underline">mizukibeautifulmoon123@gmail.com</a></p>
                <p>WhatsApp/Call: <a href="tel:+919942322743" className="text-primary hover:underline">+91 9942322743</a></p>
              </div>
              <p className="mt-4 text-sm italic">
                By using our services, you acknowledge that you have read and understood this Disclaimer Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
