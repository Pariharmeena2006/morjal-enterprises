const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addNews() {
  const newsArticles = [
    {
      title: "MORJAL Enterprises Expands Safety Equipment Distribution",
      slug: "morjal-entersprizes-expands-safety-equipment-distribution",
      excerpt: "MORJAL Enterprises is proud to announce its expansion in safety equipment distribution across Rajasthan, bringing high-quality electrical safety products to more workplaces.",
      content: "MORJAL Enterprises continues to lead the way in providing electrical safety equipment across Rajasthan. With our expanded distribution network, we are now able to serve more businesses and industries with our premium safety products. Our commitment to quality and customer satisfaction remains our top priority.",
      imageUrl: "/owner/news article 1.jpeg",
      authorName: "Devraj Morjal",
      authorTitle: "Founder & CEO",
      published: true
    },
    {
      title: "Award for Excellence in Safety Equipment Supply",
      slug: "award-for-excellence-in-safety-equipment-supply",
      excerpt: "Recognized for outstanding contribution to workplace safety, MORJAL Enterprises receives prestigious award for excellence in safety equipment supply.",
      content: "We are honored to receive recognition for our dedication to workplace safety. This award reflects our team's hard work and commitment to providing the best safety equipment to our customers. We continue to innovate and improve our services to meet the highest industry standards.",
      imageUrl: "/owner/news article 2.jpeg",
      authorName: "Devraj Morjal",
      authorTitle: "Founder & CEO",
      published: true
    },
    {
      title: "New Safety Products Launch - Advanced Protection",
      slug: "new-safety-products-launch-advanced-protection",
      excerpt: "Introducing our latest range of advanced safety products designed to provide superior protection for electrical workers and industrial professionals.",
      content: "MORJAL Enterprises is excited to launch our new line of advanced safety products. These products feature cutting-edge technology and enhanced protection features to ensure maximum safety for electrical workers. Our team has worked tirelessly to develop products that meet the evolving needs of modern workplaces.",
      imageUrl: "/owner/news article 3.jpeg",
      authorName: "Devraj Morjal",
      authorTitle: "Founder & CEO",
      published: true
    }
  ]

  for (const article of newsArticles) {
    try {
      const existing = await prisma.news.findUnique({
        where: { slug: article.slug }
      })

      if (existing) {
        console.log(`Skipping existing article: ${article.title}`)
        continue
      }

      await prisma.news.create({
        data: article
      })
      console.log(`Added: ${article.title}`)
    } catch (error) {
      console.error(`Error adding ${article.title}:`, error)
    }
  }

  console.log('Done!')
}

addNews()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
