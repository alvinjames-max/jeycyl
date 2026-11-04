import React from "react";
import Link from "next/link";
import { Cake, Phone, MapPin, Clock, MessageSquare, ShieldCheck, Heart } from "lucide-react";
import { FrostingScallop } from "./FrostingScallop";

export function Footer() {
  return (
    <footer className="mt-auto relative bg-[#3D1436] text-[#FBEEF2] pt-0">
      {/* Decorative scalloped frosting border transition */}
      <div className="-mt-4 text-[#FBEEF2]">
        <FrostingScallop color="#FBEEF2" direction="down" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Craft */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FBEEF2] flex items-center justify-center text-[#3D1436]">
                <Cake className="w-5 h-5 text-[#C9A227]" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                  Jeycyl Cakes
                </span>
                <span className="text-xs uppercase tracking-widest text-[#C9A227]">
                  Nairobi • Kenya
                </span>
              </div>
            </div>
            <p className="text-sm text-[#FBEEF2]/80 leading-relaxed font-sans">
              Handcrafting bespoke celebration cakes, fluffy sponge layers, and decadent ganache frostings for Nairobi’s sweetest moments.
            </p>
          </div>

          {/* Col 2: Bakery Hours & Service */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#C9A227] flex items-center gap-2">
              <Clock className="w-4 h-4" /> Bakery Hours
            </h4>
            <ul className="text-sm space-y-1.5 text-[#FBEEF2]/80 font-sans">
              <li><span className="font-medium text-white">Mon – Fri:</span> 8:00 AM – 6:30 PM</li>
              <li><span className="font-medium text-white">Saturday:</span> 8:30 AM – 6:00 PM</li>
              <li><span className="font-medium text-white">Sunday:</span> 10:00 AM – 3:00 PM</li>
              <li className="pt-2 text-xs text-[#C9A227] italic">
                *Order at least 24 hours in advance for custom tier designs.
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#C9A227] flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Nairobi Delivery
            </h4>
            <div className="text-sm space-y-2 text-[#FBEEF2]/80 font-sans">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <span>Delivering across Nairobi, Westlands, Kilimani, Karen, Ngong Rd, & Environs.</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>+254 712 345 678</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7C9473] shrink-0" />
                <span>Automated WhatsApp order updates</span>
              </p>
            </div>
          </div>

          {/* Col 4: Quick links & Payments */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#C9A227]">
              Lipa na M-Pesa & Tracking
            </h4>
            <p className="text-sm text-[#FBEEF2]/80 leading-relaxed font-sans">
              Till: 987654. We accept M-Pesa, Cash, and Card. Track live progress anytime.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <Link
                href="/track"
                className="inline-flex items-center gap-1.5 text-xs text-[#FBEEF2]/80 hover:text-[#C9A227] transition-colors py-1 px-2.5 rounded bg-white/5 border border-white/10"
              >
                <span>Track Order</span>
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 text-xs text-[#FBEEF2]/80 hover:text-[#C9A227] transition-colors py-1 px-2.5 rounded bg-white/5 border border-white/10"
              >
                <span>Menu</span>
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-[#FBEEF2]/70 hover:text-[#C9A227] transition-colors py-1 px-2.5 rounded bg-white/5 border border-white/10"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Staff Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FBEEF2]/60 gap-4">
          <p>© {new Date().getFullYear()} Jeycyl Cakes Kenya. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Baked with <Heart className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" /> in Nairobi
          </p>
        </div>
      </div>
    </footer>
  );
}
