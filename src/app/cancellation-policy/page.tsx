import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-grey-light py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Cancellation Policy</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-6 w-6 mr-3 text-navy" />
                  Order Cancellation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  You can cancel your order under the following conditions:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Orders can be cancelled before they are shipped</li>
                  <li>• Cancellation requests must be made within 24 hours of order placement</li>
                  <li>• Once shipped, cancellation requests will be processed as returns</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Cancel an Order</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-gray-700">
                  <li>1. Contact our customer support immediately via email or phone</li>
                  <li>2. Provide your order number and cancellation request</li>
                  <li>3. Our team will check the order status and process your cancellation</li>
                  <li>4. You will receive confirmation once the cancellation is processed</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund for Cancelled Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Refund processing timeline:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Prepaid orders: Refund initiated within 2-3 business days</li>
                  <li>• Amount credited to original payment method in 5-7 business days</li>
                  <li>• COD orders: No refund required as payment is not collected</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Non-Cancellable Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  The following orders cannot be cancelled:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Orders that have already been shipped</li>
                  <li>• Customized or personalized products</li>
                  <li>• Orders with special bulk pricing arrangements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partial Cancellations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  If your order contains multiple items, you may request cancellation of specific items before shipping. The remaining items will be processed normally, and you will be refunded for the cancelled items.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact for Cancellations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Email: info@morjalenterprises.com<br />
                  Phone: +91 XXXXX XXXXX<br />
                  For urgent cancellations, please call us directly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
