"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ShoppingBag,
  Filter,
  RefreshCw,
  MessageSquare,
  Cake as CakeIcon,
  Heart,
} from "lucide-react";
import { Cake } from "@/lib/types";
import { api } from "@/lib/api";
import { CakeCard } from "@/components/CakeCard";
import { CustomizeCakeModal } from "@/components/CustomizeCakeModal";
import { FrostingScallop, ScallopedCardTrim } from "@/components/FrostingScallop";

const CATEGORIES = [
  { id: "all", label: "All Celebration Cakes" },
  { id: "birthday", label: "Birthday Classics" },
  { id: "wedding", label: "Wedding & Anniversary" },
  { id: "chocolate", label: "Rich Chocolate" },
  { id: "velvet", label: "Velvet & Berry" },
];

export default function MenuPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCakeForModal, setSelectedCakeForModal] = useState<Cake | null>(null);

  const fetchCakes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCakes();
      setCakes(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load cakes";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCakes();
  }, []);

  const filteredCakes = cakes.filter((cake) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cake.name.toLowerCase().includes(q) ||
      (cake.description && cake.description.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeCategory === "all") return true;
    if (activeCategory === "birthday") {
      return (
        cake.name.toLowerCase().includes("birthday") ||
        cake.name.toLowerCase().includes("vanilla") ||
        cake.name.toLowerCase().includes("fudge") ||
        (cake.description && cake.description.toLowerCase().includes("birthday"))
      );
    }
    if (activeCategory === "wedding") {
      return (
        cake.name.toLowerCase().includes("wedding") ||
        cake.name.toLowerCase().includes("white") ||
        cake.name.toLowerCase().includes("tier") ||
        (cake.description && cake.description.toLowerCase().includes("wedding"))
      );
    }
    if (activeCategory === "chocolate") {
      return (
        cake.name.toLowerCase().includes("chocolate") ||
        cake.name.toLowerCase().includes("fudge") ||
        (cake.description && cake.description.toLowerCase().includes("chocolate"))
      );
    }
    if (activeCategory === "velvet") {
      return (
        cake.name.toLowerCase().includes("velvet") ||
        cake.name.toLowerCase().includes("berry") ||
        cake.name.toLowerCase().includes("strawberry") ||
        (cake.description && cake.description.toLowerCase().includes("velvet"))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBEEF2]">
      {/* Header Banner */}
      <section className="relative bg-[#3D1436] text-white pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#C9A227] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nairobi Artisan Bakery Menu</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Our Handcrafted Cake Menu
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#FBEEF2]/80 max-w-xl mx-auto font-sans leading-relaxed">
            Freshly baked daily with premium ingredients, custom size tiers, and personalized frosting inscriptions.
          </p>

          {/* Search bar inside header */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search flavours, sizes, cake names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/20 focus:border-[#C9A227] transition-all"
            />
          </div>
        </div>

        {/* Decorative Scallop Bottom */}
        <div className="absolute bottom-0 left-0 right-0 text-[#FBEEF2]">
          <FrostingScallop color="#FBEEF2" direction="down" />
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all shadow-2xs ${
                activeCategory === cat.id
                  ? "bg-[#3D1436] text-white shadow-xs"
                  : "bg-white text-[#3D1436]/70 hover:bg-[#FFF3F6] border border-[#F0D5DD]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-6 border border-[#F0D5DD] shadow-sm animate-pulse space-y-4"
              >
                <div className="w-full h-52 bg-[#FBEEF2] rounded-xl" />
                <div className="h-5 bg-[#FBEEF2] rounded w-3/4" />
                <div className="h-4 bg-[#FBEEF2] rounded w-full" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-[#FBEEF2] rounded w-1/3" />
                  <div className="h-8 bg-[#FBEEF2] rounded-full w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 rounded-3xl bg-white border border-[#F0D5DD] shadow-xs text-center max-w-md mx-auto space-y-4">
            <CakeIcon className="w-12 h-12 text-[#C9A227] mx-auto opacity-80" />
            <h3 className="font-serif text-xl font-bold text-[#3D1436]">
              Unable to load the menu
            </h3>
            <p className="text-xs text-[#3D1436]/70">{error}</p>
            <button
              onClick={fetchCakes}
              className="btn-gold inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-[#3D1436]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Cake Grid */}
        {!loading && !error && filteredCakes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCakes.map((cake) => (
              <CakeCard
                key={cake.id}
                cake={cake}
                onOpenCustomize={(c: Cake) => setSelectedCakeForModal(c)}
              />
            ))}
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && filteredCakes.length === 0 && (
          <div className="p-12 rounded-3xl bg-white border border-[#F0D5DD] shadow-xs text-center max-w-lg mx-auto space-y-4">
            <CakeIcon className="w-12 h-12 text-[#C9A227] mx-auto opacity-70" />
            <h3 className="font-serif text-2xl font-bold text-[#3D1436]">
              No cakes match your search
            </h3>
            <p className="text-sm text-[#3D1436]/70">
              We couldn&apos;t find any cake matching &quot;{searchQuery}&quot;. You can request a bespoke custom cake designed specifically for your event!
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold text-[#3D1436]"
              >
                Clear Search Filter
              </button>
              <a
                href="https://wa.me/254700000000?text=Hi%20Jeycyl%20Cakes!%20I'd%20like%20to%20order%20a%20custom%20bespoke%20cake."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-[#EFF4EE] text-[#586E52] border border-[#7C9473]/30"
              >
                <MessageSquare className="w-4 h-4 text-[#7C9473]" />
                <span>Custom Order on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Custom Order Callout Banner */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-10 border border-[#F0D5DD] shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0">
            <ScallopedCardTrim className="text-[#3D1436]" />
          </div>

          <div className="space-y-2 text-center md:text-left pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Bespoke Pastry Crafting
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D1436]">
              Need a Custom Tier or Themed Cake?
            </h3>
            <p className="text-sm text-[#3D1436]/75 max-w-xl font-sans">
              Our Nairobi master decorators can bring any cake sketch, tiered wedding design, or corporate logo cake to life.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="https://wa.me/254700000000?text=Hi%20Jeycyl%20Cakes!%20I'd%20like%20to%20discuss%20a%20custom%20cake%20design."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-[#EFF4EE] text-[#586E52] border border-[#7C9473]/30 hover:bg-[#E2EDE1] transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#7C9473]" />
              <span>WhatsApp Design Team</span>
            </a>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-[#3D1436] bg-[#FBEEF2] hover:bg-[#F3D7E0] transition-colors"
            >
              <span>Track Existing Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal for adding cake to cart */}
      <CustomizeCakeModal
        cake={selectedCakeForModal}
        onClose={() => setSelectedCakeForModal(null)}
      />
    </div>
  );
}
