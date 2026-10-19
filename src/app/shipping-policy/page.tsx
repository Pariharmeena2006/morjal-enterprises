import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Package, Clock } from 'lucide-react'

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-grey-light py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Shipping Policy</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-6 w-6 mr-3 text-navy" />
                  Shipping Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We ship to all locations across India. Our shipping partners ensure safe and timely delivery of your electrical safety products.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-navy" />
                  Delivery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Standard delivery: 5-7 business days</li>
                  <li>• Metro cities: 3-5 business days</li>
                  <li>• Remote areas: 7-10 business days</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  Delivery times may vary based on product availability and your location.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-6 w-6 mr-3 text-navy" />
                  Shipping Charges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Free shipping on orders above ₹1,000</li>
                  <li>• Standard shipping charge: ₹99 for orders below ₹1,000</li>
                  <li>• Additional charges may apply for remote locations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Once your order is shipped, you will receive:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Email with tracking number and courier details</li>
                  <li>• SMS notification with tracking information</li>
                  <li>• Real-time tracking updates via courier website</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Restrictions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• We do not ship to PO Box addresses</li>
                  <li>• Delivery is available only to physical addresses</li>
                  <li>• Someone must be available to receive the package</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partial Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  If your order contains multiple items and some are unavailable, we may ship the available items first. You will not be charged additional shipping for partial shipments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  For any shipping-related queries, please contact our customer support team via email at info@morjalenterprises.com or call us at +91 XXXXX XXXXX.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
