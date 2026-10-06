"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Check, Sparkles } from "lucide-react";
import { Cake } from "@/lib/types";
import { resolveImageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { ScallopedCardTrim } from "./FrostingScallop";

interface CakeCardProps {
  cake: Cake;
  onOpenCustomize: (cake: Cake) => void;
}

export function CakeCard({ cake, onOpenCustomize }: CakeCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      cake_id: cake.id,
      cake_name: cake.name,
      cake_image: cake.image_url,
      unit_price: cake.base_price,
      quantity: 1,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const formattedPrice = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(cake.base_price);

  return (
    <article
      onClick={() => onOpenCustomize(cake)}
      className="piped-card group flex flex-col overflow-hidden bg-white cursor-pointer focus-within:ring-2 focus-within:ring-[#C9A227]"
    >
      {/* Card top piped frosting rim */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <ScallopedCardTrim className="text-[#3D1436]" />
      </div>

      {/* Cake Image Container */}
      <div className="relative aspect-[4/3] w-full bg-[#FBEEF2] overflow-hidden">
        {cake.image_url ? (
          <Image
            src={resolveImageUrl(cake.image_url)}
            alt={cake.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FBEEF2] to-[#F3D7E0] text-[#3D1436]/40 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center mb-2 shadow-sm text-[#C9A227]">
              🎂
            </div>
            <span className="text-xs font-serif font-medium tracking-wide">
              Freshly Baked
            </span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 z-10">
          {cake.is_available ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#7C9473]/15 text-[#586E52] border border-[#7C9473]/30 backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#7C9473] animate-pulse" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200/90 text-gray-700">
              Unavailable
            </span>
          )}
        </div>

        {/* Subtle decorative bottom frost wave inside image */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
          <ScallopedCardTrim className="text-white" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif text-xl font-bold text-[#3D1436] tracking-tight group-hover:text-[#2A0D25] transition-colors">
              {cake.name}
            </h3>
          </div>

          <p className="text-sm text-[#3D1436]/75 font-sans leading-relaxed line-clamp-2 mb-4">
            {cake.description || "Freshly baked artisan cake prepared with premium ingredients and velvety frosting."}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-4 border-t border-[#FBEEF2] flex items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#3D1436]/60 font-medium block">
              Price
            </span>
            <span className="font-serif text-xl font-bold text-[#3D1436]">
              {formattedPrice}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!cake.is_available}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                justAdded
                  ? "bg-[#7C9473] text-white"
                  : "btn-gold text-[#3D1436] hover:scale-102"
              } disabled:opacity-50 disabled:pointer-events-none`}
              aria-label={`Add ${cake.name} to cart`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add to cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCustomize(cake);
              }}
              className="p-2 rounded-full border border-[#F0D5DD] text-[#3D1436] hover:bg-[#FBEEF2] hover:border-[#C9A227] transition-colors"
              title="Customize cake (variants, messages)"
              aria-label={`Customize ${cake.name}`}
            >
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
