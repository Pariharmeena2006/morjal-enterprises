'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  const [contactDetails, setContactDetails] = useState({ phone: '', secondaryPhone: '', email: '', address: '', whatsapp: '' })

  useEffect(() => {
    fetch('/api/store-settings')
      .then((response) => response.json())
      .then((settings) => setContactDetails({
        phone: '9694142555', secondaryPhone: '8003351113', email: settings.contactEmail || '',
        address: settings.contactAddress || '', whatsapp: settings.whatsappNumber || '',
      }))
      .catch(() => undefined)
  }, [])

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const subject = encodeURIComponent(String(values.get('subject') || 'Website enquiry'))
    const body = encodeURIComponent(`Name: ${values.get('name')}\nEmail: ${values.get('email')}\nPhone: ${values.get('phone')}\n\n${values.get('message')}`)
    if (contactDetails.email) window.location.href = `mailto:${contactDetails.email}?subject=${subject}&body=${body}`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="bg-gradient-to-br from-navy via-navy-deep to-navy py-12 text-white sm:py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            variants={itemVariants}
            className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Contact Us
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="mx-auto max-w-2xl text-base text-gray-300 sm:text-xl"
          >
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-white py-10 sm:py-16"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="bg-background-light rounded-2xl p-4 sm:p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Phone</h3>
                    <div className="flex flex-col items-start gap-1">
                      {[contactDetails.phone, contactDetails.secondaryPhone].filter(Boolean).map((phone) => <a key={phone} href={`tel:${phone}`} className="break-all text-text hover:text-navy">{phone}</a>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background-light p-6 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">WhatsApp</h3>
                    {contactDetails.whatsapp ? <a className="text-text hover:text-navy" href={`https://wa.me/${contactDetails.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{contactDetails.whatsapp}</a> : <p className="text-text">WhatsApp contact not configured</p>}
                  </div>
                </div>
              </div>

              <div className="bg-background-light p-6 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Email</h3>
                    <p className="text-text">{contactDetails.email || 'Email not configured'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-light p-6 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Address</h3>
                      <p className="break-words text-text">{contactDetails.address || 'Kota, Rajasthan, India'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-light p-6 rounded-2xl">
                <h3 className="font-semibold text-navy mb-2">Business Hours</h3>
                <p className="text-text">
                  Monday - Saturday: 9:00 AM - 6:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-8">
                <h2 className="mb-5 text-xl font-bold text-navy sm:mb-6 sm:text-2xl">Send us a Message</h2>
                <form className="space-y-5 sm:space-y-6" onSubmit={sendMessage}>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                    <div>
                      <Label htmlFor="name" className="text-navy font-medium">Full Name *</Label>
                      <Input 
                        id="name"
                        name="name"
                        placeholder="Your name" 
                        required 
                        className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-navy font-medium">Email *</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email" 
                        placeholder="your@email.com" 
                        required 
                        className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-navy font-medium">Phone Number *</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      type="tel" 
                      placeholder="10-digit mobile number" 
                      required 
                      className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-navy font-medium">Subject *</Label>
                    <Input 
                      id="subject"
                      name="subject"
                      placeholder="How can we help you?" 
                      required 
                      className="mt-2 py-3 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-navy font-medium">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                      className="mt-2 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-navy text-white hover:bg-navy-deep py-4 rounded-xl font-semibold"
                  >
                    {contactDetails.email ? 'Open email to send' : 'Email is not configured'}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
