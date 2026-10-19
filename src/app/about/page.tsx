'use client'

import { motion } from 'framer-motion'

export default function AboutPage() {
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
        className="bg-gradient-to-br from-navy via-navy-deep to-navy py-14 text-white sm:py-24"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            variants={itemVariants}
            className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            About MORJAL Enterprises
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="mx-auto max-w-2xl text-base text-gray-300 sm:text-xl"
          >
            Your trusted partner for premium electrical safety products in India
          </motion.p>
        </div>
      </motion.section>

      {/* Our Story */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-white py-12 sm:py-20"
      >
        <div className="container mx-auto px-4">
          <div className="grid min-w-0 gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div variants={itemVariants}>
              <h2 className="mb-5 text-3xl font-bold text-navy sm:mb-6 sm:text-4xl">Our Story</h2>
              <p className="mb-4 text-base leading-relaxed text-text sm:text-lg">
                MORJAL Enterprises was established with a clear mission: to provide workplaces across India with high-quality electrical safety products that protect lives and ensure regulatory compliance.
              </p>
              <p className="mb-4 text-base leading-relaxed text-text sm:text-lg">
                We understand that electrical safety is not just about compliance—it&apos;s about protecting the lives of workers who depend on reliable equipment every day. That&apos;s why we carefully curate our product range from trusted manufacturers who share our commitment to quality and safety.
              </p>
              <p className="text-base leading-relaxed text-text sm:text-lg">
                Based in Kota, Rajasthan, we serve customers across India with premium electrical safety equipment designed for various industrial applications.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="relative">
              {/* Image Placeholder - User will add their image */}
              <div className="flex min-h-64 items-center justify-center rounded-3xl bg-gradient-to-br from-navy to-navy-deep p-6 text-white sm:h-96 sm:p-8">
                <p className="text-gray-300 text-center">
                  Add your company image here
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Mission and Vision */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-background-light py-12 sm:py-20"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              variants={itemVariants}
              className="rounded-2xl bg-white p-5 shadow-lg sm:p-8"
            >
              <h2 className="text-3xl font-bold text-navy mb-4">Our Mission</h2>
              <p className="text-text text-lg leading-relaxed">
                To be India&apos;s most trusted provider of electrical safety products, ensuring every workplace has access to premium quality equipment that protects workers and promotes a culture of safety.
              </p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="rounded-2xl bg-white p-5 shadow-lg sm:p-8"
            >
              <h2 className="text-3xl font-bold text-navy mb-4">Our Vision</h2>
              <p className="text-text text-lg leading-relaxed">
                To create safer working environments across all industries by delivering innovative, reliable, and certified electrical safety solutions backed by exceptional customer service and technical expertise.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-white py-12 sm:py-20"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            variants={itemVariants}
            className="mb-8 text-3xl font-bold text-center text-navy sm:mb-12 sm:text-4xl"
          >
            Our Core Values
          </motion.h2>
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8"
          >
            {[
              { title: 'Safety First', desc: 'Every product meets stringent safety standards' },
              { title: 'Quality Assured', desc: 'Sourced from trusted manufacturers' },
              { title: 'Customer Focus', desc: 'Your satisfaction is our priority' },
              { title: 'Reliable Delivery', desc: 'Fast shipping across India' }
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="rounded-2xl bg-background-light p-5 text-center transition-all duration-300 hover:shadow-lg sm:p-8"
              >
                <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-gold font-bold text-2xl">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-2">{value.title}</h3>
                <p className="text-text">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-gradient-to-br from-navy to-navy-deep py-12 text-white sm:py-20"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            variants={itemVariants}
            className="mb-8 text-3xl font-bold text-center sm:mb-12 sm:text-4xl"
          >
            Why Choose MORJAL Enterprises?
          </motion.h2>
          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { title: 'Certified Products', desc: 'All products meet relevant safety standards and certifications' },
              { title: 'Expert Guidance', desc: 'Our team provides expert advice on product selection' },
              { title: 'Competitive Pricing', desc: 'Premium quality at competitive prices' },
              { title: 'Fast Delivery', desc: 'Quick shipping across India with tracking' },
              { title: 'After-Sales Support', desc: 'Dedicated support for all queries' },
              { title: 'Easy Returns', desc: 'Hassle-free return policy' }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center mb-4">
                  <span className="text-navy font-bold text-xl">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
