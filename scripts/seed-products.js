const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding products...')

  const products = [
    {
      name: 'Insulated Safety Gloves - Class 0',
      slug: 'insulated-safety-gloves-class-0',
      shortDescription: 'High-voltage insulated gloves for electrical work up to 1000V',
      description: 'Premium quality rubber insulated gloves designed for electrical workers. Class 0 rated for up to 1000V AC. Features rolled cuffs for easy donning and doffing. Made from natural rubber for maximum flexibility and durability.',
      sellingPrice: 2500,
      mrp: 3500,
      stockQuantity: 50,
      isOutOfStock: false,
      isPublished: true,
      category: 'gloves',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500', alt: 'Insulated Safety Gloves' }
        ]
      }
    },
    {
      name: 'Insulated Safety Gloves - Class 1',
      slug: 'insulated-safety-gloves-class-1',
      shortDescription: 'Heavy-duty insulated gloves for electrical work up to 7500V',
      description: 'Professional grade insulated gloves rated for Class 1 (7500V). Extra thick rubber construction for maximum protection. Features anatomical design for better grip and comfort. Ideal for high-voltage applications.',
      sellingPrice: 4500,
      mrp: 6000,
      stockQuantity: 30,
      isOutOfStock: false,
      isPublished: true,
      category: 'gloves',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500', alt: 'Heavy Duty Insulated Gloves' }
        ]
      }
    },
    {
      name: 'Insulated Screwdriver Set - 6 Piece',
      slug: 'insulated-screwdriver-set-6-piece',
      shortDescription: 'VDE certified insulated screwdriver set for electrical work',
      description: 'Complete set of 6 VDE certified insulated screwdrivers. Includes Phillips and flathead tips in various sizes. 1000V insulation rating. Ergonomic handles for comfortable grip. Magnetic tips for easy screw handling.',
      sellingPrice: 1800,
      mrp: 2500,
      stockQuantity: 100,
      isOutOfStock: false,
      isPublished: true,
      category: 'tools',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500', alt: 'Insulated Screwdriver Set' }
        ]
      }
    },
    {
      name: 'Insulated Pliers Set - 3 Piece',
      slug: 'insulated-pliers-set-3-piece',
      shortDescription: 'VDE certified insulated pliers for electrical applications',
      description: 'Set of 3 insulated pliers including combination pliers, long nose pliers, and diagonal cutters. 1000V insulation rating. Chrome vanadium steel construction for durability. Comfortable grip handles.',
      sellingPrice: 2200,
      mrp: 3000,
      stockQuantity: 75,
      isOutOfStock: false,
      isPublished: true,
      category: 'tools',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500', alt: 'Insulated Pliers Set' }
        ]
      }
    },
    {
      name: 'Safety Helmet - Electrical',
      slug: 'safety-helmet-electrical',
      shortDescription: 'Electrical safety helmet with arc flash protection',
      description: 'Premium electrical safety helmet with arc flash protection. Features ventilation slots for comfort. Adjustable chin strap for secure fit. Compatible with various accessories. Meets ANSI/ISEA Z89.1 standards.',
      sellingPrice: 1500,
      mrp: 2200,
      stockQuantity: 60,
      isOutOfStock: false,
      isPublished: true,
      category: 'helmets',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596557455961-33a9c9e1e4c8?w=500', alt: 'Electrical Safety Helmet' }
        ]
      }
    },
    {
      name: 'Safety Helmet - Industrial',
      slug: 'safety-helmet-industrial',
      shortDescription: 'Heavy-duty industrial safety helmet with impact protection',
      description: 'Industrial grade safety helmet with superior impact protection. High-density polyethylene shell. Sweatband and harness for comfort. Available in multiple colors. Meets all safety standards.',
      sellingPrice: 1200,
      mrp: 1800,
      stockQuantity: 80,
      isOutOfStock: false,
      isPublished: true,
      category: 'helmets',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596557455961-33a9c9e1e4c8?w=500', alt: 'Industrial Safety Helmet' }
        ]
      }
    },
    {
      name: 'Safety Boots - Electrical Hazard',
      slug: 'safety-boots-electrical-hazard',
      shortDescription: 'Electrical hazard rated safety boots for electrical work',
      description: 'Electrical hazard rated safety boots with steel toe. Waterproof leather upper. Slip-resistant rubber outsole. Shock-absorbing midsole for comfort. Meets ASTM F2413 EH standards.',
      sellingPrice: 3500,
      mrp: 5000,
      stockQuantity: 40,
      isOutOfStock: false,
      isPublished: true,
      category: 'boots',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500', alt: 'Electrical Safety Boots' }
        ]
      }
    },
    {
      name: 'Safety Boots - Composite Toe',
      slug: 'safety-boots-composite-toe',
      shortDescription: 'Lightweight composite toe safety boots for all-day comfort',
      description: 'Composite toe safety boots for metal-free protection. Lightweight design for reduced fatigue. Breathable mesh lining. Oil and slip resistant outsole. Ideal for long work shifts.',
      sellingPrice: 3200,
      mrp: 4500,
      stockQuantity: 55,
      isOutOfStock: false,
      isPublished: true,
      category: 'boots',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500', alt: 'Composite Toe Safety Boots' }
        ]
      }
    },
    {
      name: 'Arc Flash Suit - 40 Cal',
      slug: 'arc-flash-suit-40-cal',
      shortDescription: '40 cal/cm² arc flash protection suit for electrical workers',
      description: 'Complete arc flash protection suit rated for 40 cal/cm². Includes jacket, pants, hood, and gloves. Multi-layer fabric construction. Flame resistant and moisture wicking. Essential for high-energy electrical work.',
      sellingPrice: 15000,
      mrp: 20000,
      stockQuantity: 15,
      isOutOfStock: false,
      isPublished: true,
      category: 'gloves',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1504384308090-c54be3852f33?w=500', alt: 'Arc Flash Suit' }
        ]
      }
    },
    {
      name: 'Insulated Matting - 3mm',
      slug: 'insulated-matting-3mm',
      shortDescription: 'Electrical insulating matting for switchboard protection',
      description: 'High-quality electrical insulating matting for switchboard protection. 3mm thickness with 1000V rating. Anti-slip surface for safety. Flame resistant rubber material. Available in various sizes.',
      sellingPrice: 800,
      mrp: 1200,
      stockQuantity: 200,
      isOutOfStock: false,
      isPublished: true,
      category: 'tools',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1504384308090-c54be3852f33?w=500', alt: 'Insulated Matting' }
        ]
      }
    },
    {
      name: 'Voltage Detector Pen',
      slug: 'voltage-detector-pen',
      shortDescription: 'Non-contact voltage detector pen for live wire detection',
      description: 'Non-contact voltage detector pen for quick live wire detection. LED and audible indicators. Sensitivity adjustment for different voltage ranges. Pocket-sized for convenience. Battery included.',
      sellingPrice: 650,
      mrp: 900,
      stockQuantity: 150,
      isOutOfStock: false,
      isPublished: true,
      category: 'tools',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500', alt: 'Voltage Detector Pen' }
        ]
      }
    },
    {
      name: 'Insulated Wrench Set - 8 Piece',
      slug: 'insulated-wrench-set-8-piece',
      shortDescription: 'VDE certified insulated wrench set for electrical maintenance',
      description: 'Set of 8 insulated wrenches in metric sizes. 1000V insulation rating. Chrome vanadium steel construction. Double-ended design for versatility. Storage case included.',
      sellingPrice: 2800,
      mrp: 3800,
      stockQuantity: 45,
      isOutOfStock: false,
      isPublished: true,
      category: 'tools',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500', alt: 'Insulated Wrench Set' }
        ]
      }
    },
    {
      name: 'Safety Goggles - Anti-Fog',
      slug: 'safety-goggles-anti-fog',
      shortDescription: 'Anti-fog safety goggles with UV protection',
      description: 'Premium safety goggles with anti-fog coating. UV protection for eye safety. Adjustable strap for secure fit. Scratch-resistant lens. Ventilated design to prevent fogging.',
      sellingPrice: 450,
      mrp: 650,
      stockQuantity: 300,
      isOutOfStock: false,
      isPublished: true,
      category: 'helmets',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596557455961-33a9c9e1e4c8?w=500', alt: 'Safety Goggles' }
        ]
      }
    },
    {
      name: 'Ear Protection - Electronic',
      slug: 'ear-protection-electronic',
      shortDescription: 'Electronic ear protection with communication capability',
      description: 'Electronic ear protection muffs with communication feature. Noise reduction rating of 25dB. Amplifies low-level sounds while blocking harmful noise. Adjustable headband. Battery powered.',
      sellingPrice: 3500,
      mrp: 5000,
      stockQuantity: 35,
      isOutOfStock: false,
      isPublished: true,
      category: 'helmets',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596557455961-33a9c9e1e4c8?w=500', alt: 'Electronic Ear Protection' }
        ]
      }
    },
    {
      name: 'High-Visibility Vest - Class 2',
      slug: 'high-visibility-vest-class-2',
      shortDescription: 'Class 2 high-visibility safety vest with reflective strips',
      description: 'ANSI/ISEA Class 2 high-visibility safety vest. Bright fluorescent material with reflective strips. Mesh back for breathability. Multiple pockets for tools. Adjustable fit with side closures.',
      sellingPrice: 550,
      mrp: 800,
      stockQuantity: 250,
      isOutOfStock: false,
      isPublished: true,
      category: 'helmets',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1504384308090-c54be3852f33?w=500', alt: 'High Visibility Vest' }
        ]
      }
    },
    {
      name: 'Insulated Cable Cutter',
      slug: 'insulated-cable-cutter',
      shortDescription: 'Heavy-duty insulated cable cutter for thick cables',
      description: 'Heavy-duty insulated cable cutter for cutting thick cables. 1000V insulation rating. High-leverage design for easy cutting. Heat-treated blades for durability. Comfortable grip handles.',
      sellingPrice: 1900,
      mrp: 2700,
      stockQuantity: 60,
      isOutOfStock: false,
      isPublished: true,
      category: 'tools',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500', alt: 'Insulated Cable Cutter' }
        ]
      }
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
    console.log(`Created product: ${product.name}`)
  }

  console.log('Products seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
