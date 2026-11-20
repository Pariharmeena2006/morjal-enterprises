const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateSettings() {
  const settings = {
    ownerName: "Devraj Morjal",
    ownerTitle: "Founder & CEO",
    ownerImageUrl: "/owner/profile.png",
    ownerBio: "Leading MORJAL Enterprises with a commitment to workplace safety and quality electrical equipment across Rajasthan.",
    ownerAchievements: "Award for Excellence in Safety Equipment Supply\nPioneer in Safety Equipment Distribution\nTrusted by Industries Across Rajasthan\n10+ Years of Experience in Safety Solutions",
    contactPhone: "9694142555",
    whatsappNumber: "8003351113",
    contactEmail: "Morjalenterprises555@gmail.com",
    contactAddress: "Bundi, Rajasthan"
  }

  try {
    const existing = await prisma.websiteSettings.findFirst()

    if (existing) {
      await prisma.websiteSettings.update({
        where: { id: existing.id },
        data: settings
      })
      console.log('Settings updated successfully!')
    } else {
      await prisma.websiteSettings.create({
        data: settings
      })
      console.log('Settings created successfully!')
    }
  } catch (error) {
    console.error('Error updating settings:', error)
  }

  console.log('Done!')
}

updateSettings()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
