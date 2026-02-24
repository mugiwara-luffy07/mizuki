import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Refund Policy</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Last Updated: {new Date().toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              This Refund Policy outlines our policy regarding returns, refunds, and exchanges.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. General Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">
                <strong>Returns are generally not available.</strong> We accept returns only for 
                admin-side issues such as:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Wrong product shipped</li>
                <li>Defective or damaged products (due to our error)</li>
                <li>Significant quality issues not matching product description</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Return Process</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">To request a return:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Email us at <a href="mailto:enquiry@asfffdf.com" className="text-primary hover:underline">enquiry@asfffdf.com</a> within 7 days of delivery</li>
                <li>Include your order number and reason for return</li>
                <li>Provide an unboxing video (mandatory)</li>
                <li>Wait for approval from our team</li>
                <li>Return shipping costs are borne by the customer</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Unboxing Video Requirement</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                An unboxing video is mandatory for all return requests. The video must clearly show:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>The sealed package before opening</li>
                <li>The complete unboxing process</li>
                <li>Any defects or issues with the product</li>
                <li>The product in its received condition</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Return Conditions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="mb-4">Products must be returned in:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Original packaging (if possible)</li>
                <li>Unused and unworn condition</li>
                <li>With all tags and labels attached</li>
                <li>With proof of purchase (order number)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Refund Processing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc list-inside space-y-2">
                <li>Refunds will be processed within 7-14 business days after we receive and inspect the returned product</li>
                <li>Refunds will be issued to the original payment method</li>
                <li>Shipping costs are non-refundable (except for our errors)</li>
                <li>Return shipping costs are the customer's responsibility</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Non-Refundable Items</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>The following are not eligible for returns or refunds:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Custom orders (made-to-measure items)</li>
                <li>Items damaged by customer misuse</li>
                <li>Items returned after 7 days of delivery</li>
                <li>Items without unboxing video</li>
                <li>Items that have been worn, washed, or altered</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Color Variations</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Minor color variations may occur due to photography, lighting, or device display settings. 
                These variations do not constitute a defect and are not grounds for return.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                For return requests or questions about this policy, contact us at{' '}
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













