import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept online payments through Razorpay (UPI, Credit/Debit Cards, Net Banking, and Wallets) and Cash on Delivery (COD) for eligible orders."
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery takes 5-7 business days across India. Delivery times may vary based on your location and product availability."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 7 days of delivery for defective or incorrect products. Please refer to our Return Policy page for detailed information."
  },
  {
    question: "Are your products certified?",
    answer: "Yes, all our electrical safety products meet relevant safety standards and certifications. We source only from trusted manufacturers."
  },
  {
    question: "Can I track my order?",
    answer: "Yes, once your order is shipped, you will receive a tracking number via email/SMS. You can also track your order from our Track Order page."
  },
  {
    question: "Do you offer bulk discounts?",
    answer: "Yes, we offer special pricing for bulk orders. Please contact us directly with your requirements for a custom quote."
  },
  {
    question: "What if I receive a damaged product?",
    answer: "If you receive a damaged product, please contact us within 24 hours with photos of the damage. We will arrange for a replacement or refund."
  },
  {
    question: "Can I cancel my order?",
    answer: "Orders can be cancelled before they are shipped. Once shipped, cancellation requests will be processed as returns. Please check our Cancellation Policy for details."
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-grey-light py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, orders, and policies
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-start space-x-3">
                  <HelpCircle className="h-6 w-6 text-navy flex-shrink-0 mt-1" />
                  <span className="text-lg">{faq.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 ml-9">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="max-w-3xl mx-auto mt-12 bg-navy text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-300 mb-6">
              Can&apos;t find the answer you&apos;re looking for? Please reach out to our customer support team.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="tel:+91XXXXXXXXXX" className="inline-flex items-center px-6 py-3 bg-gold text-white rounded-md hover:bg-gold-dark transition-colors">
                Call Us
              </a>
              <a href="mailto:info@morjalenterprises.com" className="inline-flex items-center px-6 py-3 bg-white text-navy rounded-md hover:bg-gray-100 transition-colors">
                Email Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
