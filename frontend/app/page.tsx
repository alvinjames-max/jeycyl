"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Search,
  RefreshCw,
  Heart,
  Truck,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Cake } from "@/lib/types";
import { api } from "@/lib/api";
import { CakeCard } from "@/components/CakeCard";
import { CustomizeCakeModal } from "@/components/CustomizeCakeModal";
import { FrostingScallop } from "@/components/FrostingScallop";

export default function CatalogPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    const matchesSearch =
      cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cake.description &&
        cake.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-gradient-to-b from-[#FBEEF2] via-[#FFF3F6] to-[#FBEEF2] pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Subtle decorative bakery background accents */}
        <div className="absolute top-6 left-8 text-2xl select-none opacity-30 pointer-events-none animate-pulse">
          ✨
        </div>
        <div className="absolute top-20 right-12 text-3xl select-none opacity-20 pointer-events-none">
          🎂
        </div>
        <div className="absolute bottom-16 left-1/4 text-2xl select-none opacity-25 pointer-events-none">
          🌸
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#F0D5DD] text-[#3D1436] text-xs font-semibold tracking-wider uppercase mb-6 shadow-xs backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-[#C9A227]" />
            <span>Nairobi’s Handcrafted Artisan Bakery</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#3D1436] tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Baked with Love, <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#C9A227]">
              Celebrated with Joy.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#3D1436]/80 font-sans max-w-2xl mx-auto leading-relaxed">
            From luscious Belgian chocolate ganache to velvety red velvet,
            each cake is hand-piped to order in Nairobi to make your birthday,
            wedding, or milestone unforgettable.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#catalog"
              className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:scale-102 transition-transform"
            >
              <ShoppingBag className="w-5 h-5 text-[#3D1436]" />
              <span className="text-[#3D1436]">Explore Our Cakes</span>
            </a>
            <Link
              href="/#about"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-[#3D1436] bg-white border border-[#F0D5DD] hover:bg-[#FBEEF2] transition-colors"
            >
              <span>Our Story & Nairobi Delivery</span>
            </Link>
          </div>
        </div>

        {/* Hero Section Frosting Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 text-white">
          <FrostingScallop color="#FFFFFF" direction="down" />
        </div>
      </section>

      {/* ================= CATALOG SECTION ================= */}
      <section id="catalog" className="bg-white py-14 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#FBEEF2]">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#C9A227] block mb-1">
                Fresh From The Oven
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D1436]">
                Our Celebration Cakes
              </h2>
              <p className="text-sm text-[#3D1436]/70 mt-1 font-sans">
                Select your cake, personalize your piped inscription, and checkout in minutes.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <label htmlFor="cake-search" className="sr-only">
                Search cakes
              </label>
              <Search className="w-4 h-4 text-[#3D1436]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="cake-search"
                type="text"
                placeholder="Search flavors, sizes, names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#F0D5DD] bg-[#FBEEF2]/40 text-sm text-[#3D1436] placeholder-[#3D1436]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-10">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="piped-card bg-white rounded-3xl p-4 animate-pulse space-y-4"
                >
                  <div className="aspect-[4/3] bg-[#FBEEF2] rounded-2xl w-full" />
                  <div className="h-6 bg-[#FBEEF2] rounded-md w-3/4" />
                  <div className="h-4 bg-[#FBEEF2] rounded-md w-full" />
                  <div className="h-4 bg-[#FBEEF2] rounded-md w-1/2" />
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-6 bg-[#FBEEF2] rounded-md w-24" />
                    <div className="h-10 bg-[#FBEEF2] rounded-full w-28" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="my-12 p-8 rounded-3xl bg-[#FFF3F6] border border-[#F3D7E0] text-center max-w-lg mx-auto">
              <div className="text-3xl mb-3">🍰</div>
              <h3 className="font-serif text-xl font-bold text-[#3D1436] mb-2">
                Unable to load our cake catalog
              </h3>
              <p className="text-sm text-[#3D1436]/75 mb-6">{error}</p>
              <button
                type="button"
                onClick={fetchCakes}
                className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-[#3D1436]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCakes.length === 0 && (
            <div className="my-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-[#FBEEF2]/50 border border-[#F0D5DD]">
              <div className="text-4xl mb-3">🧁</div>
              <h3 className="font-serif text-2xl font-bold text-[#3D1436] mb-2">
                {cakes.length === 0
                  ? "No cakes in the catalog yet"
                  : `No cakes found matching "${searchQuery}"`}
              </h3>
              <p className="text-sm text-[#3D1436]/70 mb-6">
                {cakes.length === 0
                  ? "Our bakers are currently preparing delicious creations. Check back soon or visit the admin portal to add cakes."
                  : "Try clearing your search term to see all available celebration cakes."}
              </p>
              {cakes.length === 0 ? (
                <Link
                  href="/admin"
                  className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-[#3D1436]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Go to Admin Portal</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#3D1436] text-white hover:bg-[#2A0D25]"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Cake Cards Grid */}
          {!loading && !error && filteredCakes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-10">
              {filteredCakes.map((cake) => (
                <CakeCard
                  key={cake.id}
                  cake={cake}
                  onOpenCustomize={(selected) => setSelectedCakeForModal(selected)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Decorative scalloped divider transition into About section */}
      <div className="bg-white text-[#FBEEF2]">
        <FrostingScallop color="#FBEEF2" direction="down" />
      </div>

      {/* ================= ABOUT / BAKERY PROMISE SECTION ================= */}
      <section id="about" className="py-16 sm:py-24 bg-[#FBEEF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C9A227] block mb-1">
              Why Nairobi Loves Jeycyl
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D1436]">
              Baked for Your Milestones
            </h2>
            <p className="text-sm text-[#3D1436]/75 mt-2">
              Every celebration deserves a showstopping cake crafted with unmatched precision and warmth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#F0D5DD] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FBEEF2] text-[#3D1436] flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3D1436]">
                Fresh Daily Bake
              </h3>
              <p className="text-xs text-[#3D1436]/75 leading-relaxed font-sans">
                Never frozen. Each sponge is baked from scratch with pure butter, farm eggs, and natural extracts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#F0D5DD] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FBEEF2] text-[#3D1436] flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3D1436]">
                Nairobi Delivery
              </h3>
              <p className="text-xs text-[#3D1436]/75 leading-relaxed font-sans">
                Careful, temperature-safe doorstep courier delivery throughout Nairobi, Westlands, and estates.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#F0D5DD] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FBEEF2] text-[#3D1436] flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3D1436]">
                Custom Piping
              </h3>
              <p className="text-xs text-[#3D1436]/75 leading-relaxed font-sans">
                Add personalized hand-piped messages, names, and greetings at zero extra charge.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#F0D5DD] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FBEEF2] text-[#3D1436] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-[#7C9473]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3D1436]">
                WhatsApp Updates
              </h3>
              <p className="text-xs text-[#3D1436]/75 leading-relaxed font-sans">
                Receive automated status updates straight to your WhatsApp as your cake enters the oven.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for Customizing Cake & Inscriptions */}
      <CustomizeCakeModal
        cake={selectedCakeForModal}
        onClose={() => setSelectedCakeForModal(null)}
      />
    </div>
  );
}
