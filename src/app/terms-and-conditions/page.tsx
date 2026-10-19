import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-grey-light py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Terms and Conditions</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-navy" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  By accessing and using the MORJAL Enterprises website, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products and Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• All prices are in Indian Rupees (INR) and include applicable taxes</li>
                  <li>• We reserve the right to modify prices without prior notice</li>
                  <li>• Product images are for illustration purposes; actual products may vary</li>
                  <li>• We strive to maintain accurate product information but errors may occur</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders and Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Order confirmation is subject to product availability</li>
                  <li>• Payment must be received before order processing</li>
                  <li>• We reserve the right to cancel orders due to stock unavailability</li>
                  <li>• Fraudulent orders will be cancelled and reported</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• You are responsible for maintaining account confidentiality</li>
                  <li>• Provide accurate and complete information when creating an account</li>
                  <li>• Notify us immediately of unauthorized account access</li>
                  <li>• You are responsible for all activities under your account</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  All content on this website, including text, images, logos, and designs, is the property of MORJAL Enterprises and protected by copyright laws. Unauthorized use is prohibited.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  MORJAL Enterprises shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our liability is limited to the purchase price of the product.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in [Your City], India.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modifications to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the modified terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  For questions about these terms, contact us at:<br />
                  Email: info@morjalenterprises.com<br />
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
