/* cart.js — Jeycyl Cakes Cart (localStorage) */

const CART_KEY = 'jeycyl_cart';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: items }));
}

export function addToCart(cake, variant = null, qty = 1) {
  const cart = getCart();
  const key  = variant ? `${cake.id}-${variant.id}` : `${cake.id}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      key,
      cakeId:        cake.id,
      cakeVariantId: variant ? variant.id : null,
      name:          cake.name,
      variantLabel:  variant ? `${variant.size}${variant.flavor ? ' · ' + variant.flavor : ''}` : null,
      imageUrl:      cake.image_url || null,
      unitPrice:     variant ? (cake.base_price + variant.price_modifier) : cake.base_price,
      quantity:      qty,
    });
  }
  saveCart(cart);
}

export function updateQty(key, delta) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.quantity = Math.max(0, item.quantity + delta);
  saveCart(item.quantity === 0 ? cart.filter(i => i.key !== key) : cart);
}

export function removeFromCart(key) {
  saveCart(getCart().filter(i => i.key !== key));
}

export function clearCart() { saveCart([]); }

export function cartTotal(cart) {
  return cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function cartCount(cart) {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function toOrderItems(cart) {
  return cart.map(i => ({
    cake_id:         i.cakeId,
    cake_variant_id: i.cakeVariantId || undefined,
    quantity:        i.quantity,
  }));
}
