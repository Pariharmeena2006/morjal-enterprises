import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-grey-light py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Privacy Policy</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-navy" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  We collect the following information to provide you with better service:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Personal information: Name, email, phone number, shipping address</li>
                  <li>• Order information: Products purchased, payment details</li>
                  <li>• Technical information: IP address, browser type, device information</li>
                  <li>• Communication: Emails, phone calls, chat messages</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  We use your information for:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Processing and fulfilling your orders</li>
                  <li>• Communicating about your orders and shipments</li>
                  <li>• Providing customer support</li>
                  <li>• Improving our products and services</li>
                  <li>• Sending promotional communications (with your consent)</li>
                  <li>• Preventing fraud and ensuring security</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="space-y-2 text-gray-700 mt-4">
                  <li>• Secure SSL encryption for all transactions</li>
                  <li>• PCI DSS compliant payment processing via Razorpay</li>
                  <li>• Restricted access to personal data</li>
                  <li>• Regular security audits and updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Information Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Shipping partners for order delivery</li>
                  <li>• Payment processors for transaction processing</li>
                  <li>• Service providers who assist in operating our business</li>
                  <li>• Legal authorities when required by law</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  You have the right to:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Access your personal information</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Request deletion of your data</li>
                  <li>• Opt out of marketing communications</li>
                  <li>• File a complaint with data protection authorities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  For privacy-related inquiries, contact us at:<br />
                  Email: privacy@morjalenterprises.com<br />
                  Phone: +91 XXXXX XXXXX
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
