import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RotateCcw, AlertCircle } from 'lucide-react'

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-grey-light py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Return & Refund Policy</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RotateCcw className="h-6 w-6 mr-3 text-navy" />
                  Return Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  We want you to be completely satisfied with your purchase. If you receive a defective or incorrect product, we will gladly accept returns under the following conditions:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Returns must be initiated within 7 days of delivery</li>
                  <li>• Product must be unused and in original packaging</li>
                  <li>• All tags and labels must be intact</li>
                  <li>• Original invoice must be provided</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-6 w-6 mr-3 text-red-600" />
                  Non-Returnable Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  The following items cannot be returned:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Customized or personalized products</li>
                  <li>• Products used beyond normal inspection</li>
                  <li>• Items damaged due to improper use</li>
                  <li>• Products without original packaging</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Process</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-gray-700">
                  <li>1. Contact our customer support via email or phone</li>
                  <li>2. Provide your order number and reason for return</li>
                  <li>3. Our team will review your request and provide return instructions</li>
                  <li>4. Ship the product back using the provided shipping label</li>
                  <li>5. Once received and inspected, we will process your refund</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Refunds are processed within 7-10 business days after we receive and inspect the returned product:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Refunds will be credited to the original payment method</li>
                  <li>• For COD orders, refunds will be processed via bank transfer</li>
                  <li>• Shipping charges are non-refundable unless the return is due to our error</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defective or Damaged Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  If you receive a defective or damaged product, please contact us within 24 hours of delivery with photos of the damage. We will arrange for a free replacement or full refund, including shipping costs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact for Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Email: info@morjalenterprises.com<br />
                  Phone: +91 XXXXX XXXXX<br />
                  Please include your order number in all correspondence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
