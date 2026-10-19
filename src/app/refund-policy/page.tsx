import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-grey-light py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Refund Policy</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-6 w-6 mr-3 text-navy" />
                  Refund Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Refunds are processed in the following scenarios:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Product is defective or damaged upon delivery</li>
                  <li>• Incorrect product was shipped</li>
                  <li>• Product does not match the description</li>
                  <li>• Order was cancelled before shipping</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Process</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-gray-700">
                  <li>1. Submit a refund request with order details and reason</li>
                  <li>2. Our team will review your request within 2 business days</li>
                  <li>3. If approved, return instructions will be provided</li>
                  <li>4. Product must be returned in original condition</li>
                  <li>5. Refund is processed after inspection of returned product</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Refund initiation: Within 2-3 business days after approval</li>
                  <li>• Credit to account: 5-7 business days depending on payment method</li>
                  <li>• Bank transfers: May take additional 2-3 business days</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Online payments: Refunded to original payment method</li>
                  <li>• COD orders: Refunded via bank transfer (bank details required)</li>
                  <li>• Gift cards/wallets: Refunded to the same wallet</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Non-Refundable Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Used or damaged products (not due to manufacturing defect)</li>
                  <li>• Products without original packaging</li>
                  <li>• Customized or personalized items</li>
                  <li>• Products returned after the 7-day return window</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partial Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  In case of partial returns or orders with multiple items, refunds will be processed only for the returned items. Shipping charges are non-refundable unless the return is due to our error.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact for Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Email: refunds@morjalenterprises.com<br />
                  Phone: +91 XXXXX XXXXX<br />
                  Please include your order number in all refund requests.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
