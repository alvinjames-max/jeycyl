"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageSquare,
  AlertCircle,
  Loader2,
  Phone,
  User,
  MapPin,
  FileText,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { api, resolveImageUrl } from "@/lib/api";
import { PricePreviewResponse } from "@/lib/types";
import { FrostingScallop, ScallopedCardTrim } from "@/components/FrostingScallop";

export default function CartCheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  // Customer & checkout form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Order submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Backend Price Preview calculation state
  const [preview, setPreview] = useState<PricePreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Sync pricing preview with backend pricing engine
  useEffect(() => {
    if (items.length === 0) {
      setPreview(null);
      return;
    }

    let isCancelled = false;
    setLoadingPreview(true);

    const previewItems = items.map((i) => ({
      cake_id: i.cake_id,
      cake_variant_id: i.cake_variant_id ?? null,
      quantity: i.quantity,
    }));

    api
      .previewPrice(previewItems)
      .then((data) => {
        if (!isCancelled) {
          setPreview(data);
        }
      })
      .catch((err) => {
        console.warn("Backend price preview fallback to local calculation:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoadingPreview(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [items]);

  const displayTotal = preview ? preview.total : subtotal;

  const formattedTotal = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(displayTotal);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form validation
    if (!name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Please enter your Kenyan phone number.");
      return;
    }
    if (!deliveryAddress.trim()) {
      setFormError("Please enter your Nairobi delivery address or estate.");
      return;
    }
    if (items.length === 0) {
      setFormError("Your cart is empty. Please select a cake from the catalog.");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Create or fetch existing customer by phone number
      const customer = await api.createOrGetCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: deliveryAddress.trim(),
      });

      // Step 2: Place order against the Go backend POST /orders
      const orderPayload = {
        customer_id: customer.id,
        delivery_address: deliveryAddress.trim(),
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          cake_id: item.cake_id,
          cake_variant_id: item.cake_variant_id ?? null,
          quantity: item.quantity,
          custom_message: item.custom_message?.trim() || undefined,
        })),
      };

      const placedOrder = await api.placeOrder(orderPayload);

      // Step 3: Clear cart and redirect to confirmation
      clearCart();
      router.push(`/order-confirmation?id=${placedOrder.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setFormError(msg);
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-[#3D1436]/5 flex items-center justify-center text-[#3D1436] mb-4">
          <ShoppingBag className="w-10 h-10 text-[#C9A227]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D1436] mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-[#3D1436]/70 max-w-md mb-8 font-sans">
          You haven&apos;t added any delicious cakes to your celebratory basket yet.
          Explore our artisan creations freshly baked in Nairobi.
        </p>
        <Link
          href="/"
          className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-[#3D1436] shadow-md hover:scale-102 transition-transform"
        >
          <span>Browse Cake Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-[#FBEEF2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-[#C9A227] font-semibold block mb-1">
            Review & Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D1436]">
            Your Celebration Order
          </h1>
          <p className="text-sm text-[#3D1436]/70 mt-1">
            Review your customized cakes and provide your delivery details below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ================= LEFT: CART ITEMS ================= */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5DD] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0">
                <ScallopedCardTrim className="text-[#3D1436]" />
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-[#FBEEF2] pt-2">
                <h2 className="font-serif text-xl font-bold text-[#3D1436] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C9A227]" />
                  <span>Selected Cakes ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-[#3D1436]/60 hover:text-red-700 transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#FBEEF2]">
                {items.map((item, idx) => {
                  const lineSubtotal = item.unit_price * item.quantity;
                  const formattedLineSubtotal = new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                    maximumFractionDigits: 0,
                  }).format(lineSubtotal);

                  return (
                    <div
                      key={`${item.cake_id}-${item.cake_variant_id}-${idx}`}
                      className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Image & Description */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-16 h-16 rounded-2xl bg-[#FBEEF2] overflow-hidden shrink-0 border border-[#F0D5DD]">
                          {item.cake_image ? (
                            <Image
                              src={resolveImageUrl(item.cake_image)}
                              alt={item.cake_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🎂
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-serif text-base font-bold text-[#3D1436]">
                            {item.cake_name}
                          </h3>
                          {item.variant_label && (
                            <span className="inline-block text-xs font-medium text-[#C9A227] bg-[#FCF7E6] px-2 py-0.5 rounded-md mt-0.5">
                              Variant: {item.variant_label}
                            </span>
                          )}
                          {item.custom_message && (
                            <p className="text-xs text-[#586E52] italic mt-1 bg-[#EFF4EE] px-2.5 py-1 rounded-md border border-[#7C9473]/20">
                              ✍️ Inscription: &quot;{item.custom_message}&quot;
                            </p>
                          )}
                          <div className="text-xs text-[#3D1436]/60 mt-1">
                            KES {item.unit_price} each
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-5">
                        <div className="flex items-center border border-[#F0D5DD] rounded-full overflow-hidden bg-[#FBEEF2]/50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="p-1.5 text-[#3D1436] hover:bg-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-[#3D1436]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="p-1.5 text-[#3D1436] hover:bg-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="font-serif font-bold text-base text-[#3D1436] min-w-[5rem] text-right">
                          {formattedLineSubtotal}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 text-[#3D1436]/50 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                          aria-label={`Remove ${item.cake_name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Highlights Box */}
              <div className="mt-6 p-4 rounded-2xl bg-[#FBEEF2]/60 border border-[#F0D5DD] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#3D1436]/80">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C9A227]" />
                  <span>Handled with temperature-controlled courier in Nairobi</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#7C9473]" />
                  <span>WhatsApp tracking on dispatch</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/"
                className="text-xs font-semibold text-[#3D1436] hover:text-[#C9A227] underline"
              >
                ← Add more celebration cakes
              </Link>
            </div>
          </div>

          {/* ================= RIGHT: CUSTOMER & ORDER FORM ================= */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5DD] shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0">
                <ScallopedCardTrim className="text-[#3D1436]" />
              </div>

              <h2 className="font-serif text-xl font-bold text-[#3D1436] pb-4 border-b border-[#FBEEF2] pt-2 mb-6">
                Customer & Delivery Information
              </h2>

              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="cust-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#3D1436] mb-1.5 flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    id="cust-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wanjiku Mwangi"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/30 text-[#3D1436] placeholder-[#3D1436]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="cust-phone"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#3D1436] mb-1.5 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Kenyan Phone Number *</span>
                  </label>
                  <input
                    id="cust-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678 or +254 712..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/30 text-[#3D1436] placeholder-[#3D1436]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm"
                  />
                  <p className="text-[11px] text-[#3D1436]/60 mt-1">
                    Used for WhatsApp order status updates and delivery courier coordination.
                  </p>
                </div>

                {/* Delivery Address */}
                <div>
                  <label
                    htmlFor="cust-address"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#3D1436] mb-1.5 flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Nairobi Delivery Address / Estate *</span>
                  </label>
                  <textarea
                    id="cust-address"
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Apt 4B, Kilimani Heights, Kindaruma Rd, Nairobi"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/30 text-[#3D1436] placeholder-[#3D1436]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm resize-none"
                  />
                </div>

                {/* Notes / Special Instructions */}
                <div>
                  <label
                    htmlFor="cust-notes"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#3D1436] mb-1.5 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Special Instructions / Delivery Time (Optional)</span>
                  </label>
                  <textarea
                    id="cust-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Please deliver around 2:00 PM; call when near gate."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/30 text-[#3D1436] placeholder-[#3D1436]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm resize-none"
                  />
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-[#FBEEF2] space-y-2">
                  <div className="flex justify-between text-xs text-[#3D1436]/70">
                    <span>Subtotal</span>
                    <span>{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#3D1436]/70">
                    <span>Nairobi Courier Handling</span>
                    <span className="text-[#586E52] font-semibold">Included / Free</span>
                  </div>

                  <div className="pt-2 border-t border-[#FBEEF2] flex items-baseline justify-between">
                    <div>
                      <span className="font-serif text-lg font-bold text-[#3D1436] block">
                        Total Amount
                      </span>
                      {loadingPreview && (
                        <span className="text-[10px] text-[#C9A227] flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Verifying price...
                        </span>
                      )}
                    </div>
                    <span className="font-serif text-2xl font-bold text-[#3D1436]">
                      {formattedTotal}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="btn-gold w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full text-base font-bold text-[#3D1436] shadow-md hover:scale-101 active:scale-99 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-[#3D1436]" />
                        <span>Placing Your Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Place Order</span>
                        <ArrowRight className="w-5 h-5 text-[#3D1436]" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-[#3D1436]/60 mt-2.5">
                    By submitting, your order is recorded instantly and you will receive your Order ID.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
