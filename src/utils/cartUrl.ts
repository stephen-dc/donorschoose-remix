const BASE =
  import.meta.env.VITE_DC_CART_URL ??
  'https://jackson-secure.dctest.donorschoose.org/donors/cart-import.html'

export interface CartItem {
  proposalId: string
  amount: number // dollars; rounded to nearest integer
}

export function buildCartUrl(items: CartItem[]): string {
  const params = new URLSearchParams()
  items.forEach(({ proposalId, amount }, i) => {
    params.set(`proposalId${i + 1}`, proposalId)
    params.set(`amount${i + 1}`, String(Math.round(amount)))
  })
  return `${BASE}?${params.toString()}`
}
