"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Cake, ShieldCheck, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FBEEF2]/90 backdrop-blur-md border-b border-[#F0D5DD] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227] rounded-lg p-1"
          >
            <div className="w-11 h-11 rounded-full bg-[#3D1436] flex items-center justify-center text-[#C9A227] shadow-md group-hover:scale-105 transition-transform">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#3D1436] group-hover:text-[#2A0D25] block leading-none">
                Jeycyl Cakes
              </span>
              <span className="text-xs uppercase tracking-widest text-[#C9A227] font-medium block mt-1">
                Artisan Bakery • Nairobi
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium tracking-wide transition-colors ${
                pathname === "/"
                  ? "text-[#3D1436] font-semibold border-b-2 border-[#C9A227] pb-1"
                  : "text-[#3D1436]/80 hover:text-[#3D1436]"
              }`}
            >
              Cakes Catalog
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium tracking-wide text-[#3D1436]/80 hover:text-[#3D1436] transition-colors"
            >
              Our Story
            </Link>
            <Link
              href="/admin"
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                pathname.startsWith("/admin")
                  ? "text-[#3D1436] font-semibold border-b-2 border-[#C9A227] pb-1"
                  : "text-[#3D1436]/70 hover:text-[#3D1436]"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              <span>Admin Portal</span>
            </Link>
          </nav>

          {/* Cart CTA button */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#3D1436] text-white hover:bg-[#2A0D25] focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition-all shadow-md active:scale-95"
              aria-label={`View cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5 text-[#C9A227]" />
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-[#3D1436] bg-[#C9A227] rounded-full">
                {itemCount}
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#3D1436] hover:bg-[#F3D7E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-2 border-t border-[#F0D5DD] bg-[#FBEEF2] space-y-2 animate-fadeIn">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D1436] hover:bg-[#F3D7E0]"
            >
              Cakes Catalog
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D1436] hover:bg-[#F3D7E0]"
            >
              Our Story
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-[#3D1436] hover:bg-[#F3D7E0]"
            >
              <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
              <span>Admin Portal</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
