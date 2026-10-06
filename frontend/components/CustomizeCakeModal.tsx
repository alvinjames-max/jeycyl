"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Check, ShoppingBag, Loader2 } from "lucide-react";
import { Cake, CakeVariant } from "@/lib/types";
import { api, resolveImageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { ScallopedCardTrim } from "./FrostingScallop";

interface CustomizeCakeModalProps {
  cake: Cake | null;
  onClose: () => void;
}

export function CustomizeCakeModal({ cake, onClose }: CustomizeCakeModalProps) {
  const { addItem } = useCart();
  const [fullCake, setFullCake] = useState<Cake | null>(cake);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<CakeVariant | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!cake) return;
    setFullCake(cake);
    setSelectedVariant(null);
    setCustomMessage("");
    setQuantity(1);
    setAdded(false);

    // Fetch full cake details with variants
    let isCancelled = false;
    setLoadingDetails(true);
    api
      .getCake(cake.id)
      .then((data) => {
        if (!isCancelled) {
          setFullCake(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      })
      .catch(() => {
        // Fallback to initial cake
      })
      .finally(() => {
        if (!isCancelled) setLoadingDetails(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [cake]);

  if (!cake || !fullCake) return null;

  const currentUnitPrice =
    fullCake.base_price + (selectedVariant ? selectedVariant.price_modifier : 0);
  const totalPrice = currentUnitPrice * quantity;

  const formattedUnitPrice = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(currentUnitPrice);

  const formattedTotalPrice = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(totalPrice);

  const handleAddToCart = () => {
    addItem({
      cake_id: fullCake.id,
      cake_name: fullCake.name,
      cake_image: fullCake.image_url,
      cake_variant_id: selectedVariant ? selectedVariant.id : null,
      variant_label: selectedVariant
        ? `${selectedVariant.size}${selectedVariant.flavor ? ` - ${selectedVariant.flavor}` : ""}`
        : undefined,
      unit_price: currentUnitPrice,
      quantity,
      custom_message: customMessage.trim() || undefined,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#F0D5DD] z-10 animate-scaleUp">
        {/* Top Scalloped Frosting Header */}
        <div className="bg-[#3D1436] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs uppercase tracking-widest text-[#C9A227] font-semibold block mb-1">
            Handcrafted Cake Details
          </span>
          <h2
            id="modal-title"
            className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight"
          >
            {fullCake.name}
          </h2>
        </div>

        {/* Scalloped divider between header and modal body */}
        <div className="-mt-1">
          <ScallopedCardTrim className="text-white" />
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Cake Image and Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-[#FBEEF2] border border-[#F0D5DD]">
              {fullCake.image_url ? (
                <Image
                  src={resolveImageUrl(fullCake.image_url)}
                  alt={fullCake.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-5xl">
                  🎂
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-[#3D1436]/80 leading-relaxed font-sans">
                {fullCake.description ||
                  "Freshly made to order in our Nairobi kitchen with rich butter, fluffy layers, and signature piped ganache."}
              </p>
              <div className="p-3.5 rounded-xl bg-[#FBEEF2] border border-[#F0D5DD]">
                <div className="text-xs text-[#3D1436]/60 uppercase tracking-wider font-semibold">
                  Base Price
                </div>
                <div className="font-serif text-2xl font-bold text-[#3D1436]">
                  {formattedUnitPrice}
                </div>
              </div>
            </div>
          </div>

          {/* Variants / Sizes Selection */}
          {loadingDetails ? (
            <div className="flex items-center gap-2 text-xs text-[#3D1436]/60">
              <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />
              <span>Checking available sizes and flavors...</span>
            </div>
          ) : fullCake.variants && fullCake.variants.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#3D1436]">
                Select Size & Flavor Variant:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {fullCake.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const mod = v.price_modifier;
                  const modText =
                    mod > 0 ? ` (+KES ${mod})` : mod < 0 ? ` (-KES ${Math.abs(mod)})` : "";
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                        isSelected
                          ? "border-[#C9A227] bg-[#FCF7E6] text-[#3D1436] ring-2 ring-[#C9A227]"
                          : "border-[#F0D5DD] hover:bg-[#FBEEF2] text-[#3D1436]"
                      }`}
                    >
                      <div className="font-semibold">{v.size}</div>
                      {v.flavor && <div className="text-xs text-[#3D1436]/70">{v.flavor}</div>}
                      <div className="text-xs font-bold text-[#C9A227] mt-0.5">
                        KES {fullCake.base_price + mod} {modText}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Custom Cake Inscription Message */}
          <div className="space-y-1.5">
            <label
              htmlFor="custom-cake-message"
              className="block text-sm font-semibold text-[#3D1436]"
            >
              Custom Cake Inscription / Message{" "}
              <span className="text-xs text-[#3D1436]/60 font-normal">
                (Optional — piped on top of the cake)
              </span>
            </label>
            <input
              id="custom-cake-message"
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder='e.g. "Happy 30th Birthday Brian!" or "Congratulations Dr. Mwangi"'
              maxLength={60}
              className="w-full px-4 py-3 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/40 text-[#3D1436] placeholder-[#3D1436]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <div className="text-right text-xs text-[#3D1436]/50">
              {customMessage.length}/60 characters
            </div>
          </div>

          {/* Quantity Selector & Summary */}
          <div className="pt-4 border-t border-[#F0D5DD] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#3D1436]">Quantity:</span>
              <div className="flex items-center border border-[#F0D5DD] rounded-full overflow-hidden bg-[#FBEEF2]/50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-base font-bold text-[#3D1436] hover:bg-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-bold text-[#3D1436]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 text-base font-bold text-[#3D1436] hover:bg-white transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <div className="text-xs text-[#3D1436]/60 uppercase tracking-wider font-semibold">
                  Subtotal
                </div>
                <div className="font-serif text-2xl font-bold text-[#3D1436]">
                  {formattedTotalPrice}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!fullCake.is_available}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold transition-all shadow-md ${
                  added
                    ? "bg-[#7C9473] text-white"
                    : "btn-gold text-[#3D1436]"
                } disabled:opacity-50`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-[#3D1436]" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
