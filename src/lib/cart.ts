export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  image: string
  price: number
  quantity: number
  stock: number
}

export interface CartProduct {
  id: string
  name: string
  slug: string
  sellingPrice: number
  stockQuantity: number
  images?: Array<{ url: string; alt?: string | null }>
}

const CART_KEY = 'cart'

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]')
    if (!Array.isArray(stored)) return []

    return stored.flatMap((value): CartItem[] => {
      if (!value || typeof value !== 'object') return []
      const item = value as Record<string, any>
      const productId = String(item.productId || item.id || '')
      const price = Number(item.price ?? item.sellingPrice)
      const quantity = Number(item.quantity)
      const stock = Number(item.stock ?? item.stockQuantity ?? 10)
      if (!productId || !Number.isFinite(price) || !Number.isInteger(quantity) || quantity < 1) return []
      return [{
        id: productId,
        productId,
        name: String(item.name || 'Product'),
        slug: String(item.slug || ''),
        image: String(item.image || item.images?.[0]?.url || ''),
        price,
        quantity: Math.min(quantity, Math.max(stock, 1), 10),
        stock: Math.max(0, Number.isFinite(stock) ? stock : 10),
      }]
    }).filter((item) => item.stock > 0)
  } catch {
    return []
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-updated'))
}

export function addProductToCart(product: CartProduct, quantity = 1): 'added' | 'limit' | 'unavailable' {
  const stock = Math.max(0, Number(product.stockQuantity) || 0)
  if (stock < 1) return 'unavailable'

  const cart = readCart()
  const existing = cart.find((item) => item.productId === product.id)
  if (existing) {
    const nextQuantity = Math.min(existing.quantity + quantity, stock, 10)
    if (nextQuantity === existing.quantity) return 'limit'
    existing.quantity = nextQuantity
    existing.stock = stock
  } else {
    cart.push({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0]?.url || '',
      price: Number(product.sellingPrice),
      quantity: Math.min(Math.max(1, quantity), stock, 10),
      stock,
    })
  }
  writeCart(cart)
  return 'added'
}
