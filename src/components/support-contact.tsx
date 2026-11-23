import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, PhoneCall, Mail, MessageCircle } from 'lucide-react'
import WhatsAppIcon from '@/components/whatsapp-icon'

const SUPPORT = {
  businessName: 'Morjal Enterprises',
  primaryPhone: '+91 9694142555',
  primaryPhoneHref: 'tel:+919694142555',
  secondaryPhone: '+91 8003351113',
  secondaryPhoneHref: 'tel:+918003351113',
  email: 'morjalenterprises555@gmail.com',
  whatsapp: 'https://wa.me/919694142555',
}

export default function SupportContact() {
  return (
    <Card className="border-navy/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-navy">
          <PhoneCall className="h-5 w-5 text-navy" />
          Customer Support — Contact Us
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-700">
          Need help with an order, delivery or refund? Reach the {SUPPORT.businessName} support team any time:
        </p>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-navy" />
            <span>
              Primary:{' '}
              <a href={SUPPORT.primaryPhoneHref} className="font-semibold text-navy hover:text-gold hover:underline">
                {SUPPORT.primaryPhone}
              </a>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-navy" />
            <span>
              Secondary:{' '}
              <a href={SUPPORT.secondaryPhoneHref} className="font-semibold text-navy hover:text-gold hover:underline">
                {SUPPORT.secondaryPhone}
              </a>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-navy" />
            <a href={`mailto:${SUPPORT.email}`} className="font-semibold text-navy hover:text-gold hover:underline">
              {SUPPORT.email}
            </a>
          </li>
        </ul>
        <a
          href={SUPPORT.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1eb856]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Chat on WhatsApp
          <MessageCircle className="hidden" aria-hidden="true" />
        </a>
      </CardContent>
    </Card>
  )
}
