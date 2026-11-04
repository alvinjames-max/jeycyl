"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Truck,
  Share2,
} from "lucide-react";
import { Order, OrderStatus } from "@/lib/types";
import { api } from "@/lib/api";
import { ScallopedCardTrim } from "@/components/FrostingScallop";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("id");
  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : null;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optional M-Pesa payment recording state
  const [mpesaRef, setMpesaRef] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const fetchOrder = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrder(id);
      setOrder(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && !isNaN(orderId)) {
      fetchOrder(orderId);
    } else {
      setLoading(false);
      setError("No valid order ID was provided in the confirmation link.");
    }
  }, [orderId]);

  const handleRecordMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !mpesaRef.trim()) return;

    setRecordingPayment(true);
    setPaymentError(null);
    setPaymentSuccessMsg(null);

    try {
      await api.recordPayment({
        order_id: order.id,
        amount: order.total_amount,
        method: "mpesa",
        transaction_ref: mpesaRef.trim().toUpperCase(),
      });
      setPaymentSuccessMsg(
        `Payment recorded successfully with reference ${mpesaRef.trim().toUpperCase()}! Order status is now Paid.`
      );
      // Refresh order to show updated status
      fetchOrder(order.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record payment.";
      setPaymentError(msg);
    } finally {
      setRecordingPayment(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7C9473]/20 text-[#586E52] border border-[#7C9473]/30">
            <span className="w-2 h-2 rounded-full bg-[#7C9473]" />
            Paid & Confirmed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C9A227]/20 text-[#8B6E13] border border-[#C9A227]/30">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            In the Oven / Baking
          </span>
        );
      case "ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7C9473]/20 text-[#586E52] border border-[#7C9473]/30">
            Ready for Delivery
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#3D1436]/10 text-[#3D1436] border border-[#3D1436]/20">
            <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
            Pending Payment
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A227] mb-3" />
        <p className="font-serif text-lg text-[#3D1436]">
          Retrieving your celebration order details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#3D1436] mb-2">
          Order Not Found
        </h1>
        <p className="text-sm text-[#3D1436]/70 mb-6">{error}</p>
        <Link
          href="/"
          className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-[#3D1436]"
        >
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const formattedTotal = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(order.total_amount);

  return (
    <div className="py-12 sm:py-20 bg-[#FBEEF2] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebratory Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F0D5DD] shadow-lg relative overflow-hidden mb-10">
          <div className="absolute top-0 left-0 right-0">
            <ScallopedCardTrim className="text-[#3D1436]" />
          </div>

          <div className="text-center pt-4 pb-6">
            <div className="w-20 h-20 rounded-full bg-[#EFF4EE] text-[#586E52] border-2 border-[#7C9473]/30 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce-short">
              <CheckCircle2 className="w-10 h-10 text-[#7C9473]" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCF7E6] text-[#8B6E13] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Order Received Successfully</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#3D1436] tracking-tight">
              Thank You for Your Order!
            </h1>

            <p className="mt-3 text-base text-[#3D1436]/80 max-w-xl mx-auto font-sans leading-relaxed">
              We have safely logged your order in our bakery kitchen. Our head pastry chef will prepare your artisan cake with utmost care.
            </p>
          </div>

          {/* Quick Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#FBEEF2]/60 border border-[#F0D5DD] mb-8 text-center sm:text-left">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                Order Identifier
              </span>
              <span className="font-serif text-2xl font-bold text-[#3D1436]">
                #{order.id}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                Current Status
              </span>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                Total Amount
              </span>
              <span className="font-serif text-2xl font-bold text-[#3D1436]">
                {formattedTotal}
              </span>
            </div>
          </div>

          {/* Order Details & Line Items */}
          <div className="space-y-6 pt-4 border-t border-[#FBEEF2]">
            <h2 className="font-serif text-xl font-bold text-[#3D1436]">
              Order Items & Inscriptions
            </h2>

            {order.items && order.items.length > 0 ? (
              <div className="divide-y divide-[#FBEEF2] border border-[#F0D5DD] rounded-2xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white"
                  >
                    <div>
                      <div className="font-serif font-bold text-base text-[#3D1436]">
                        Cake #{item.cake_id}{" "}
                        <span className="text-xs font-sans font-normal text-[#3D1436]/70">
                          (Qty: {item.quantity})
                        </span>
                      </div>
                      {item.custom_message && (
                        <p className="text-xs text-[#586E52] mt-1 italic bg-[#EFF4EE] px-2.5 py-1 rounded-md inline-block border border-[#7C9473]/20">
                          ✍️ Inscription: &quot;{item.custom_message}&quot;
                        </p>
                      )}
                    </div>
                    <div className="font-serif font-bold text-base text-[#3D1436]">
                      KES {item.subtotal || item.unit_price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#3D1436]/70">No line items recorded.</p>
            )}

            {/* Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FBEEF2]/40 border border-[#F0D5DD]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#3D1436] mb-1">
                  <MapPin className="w-4 h-4 text-[#C9A227]" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-sm text-[#3D1436]/80 font-sans">
                  {order.delivery_address || "Pick up at Bakery"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBEEF2]/40 border border-[#F0D5DD]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#3D1436] mb-1">
                  <FileText className="w-4 h-4 text-[#C9A227]" />
                  <span>Special Notes</span>
                </div>
                <p className="text-sm text-[#3D1436]/80 font-sans">
                  {order.notes || "No special instructions provided."}
                </p>
              </div>
            </div>
          </div>

          {/* M-Pesa Payment Box */}
          <div className="mt-8 p-6 rounded-2xl bg-[#FCF7E6] border border-[#C9A227]/30 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C9A227]" />
                  <h3 className="font-serif text-lg font-bold text-[#3D1436]">
                    Lipa na M-Pesa Payment
                  </h3>
                </div>
                <p className="text-xs text-[#3D1436]/80 mt-1 leading-relaxed">
                  Send <strong className="text-[#3D1436]">{formattedTotal}</strong> to Buy Goods Till Number{" "}
                  <strong className="text-[#3D1436] underline">987654 (Jeycyl Cakes)</strong> or Paybill{" "}
                  <strong>522522</strong> Account: <strong>{order.id}</strong>.
                </p>
              </div>
            </div>

            {order.status !== "paid" ? (
              <form
                onSubmit={handleRecordMpesa}
                className="pt-2 border-t border-[#C9A227]/20 flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="w-full sm:flex-1">
                  <label htmlFor="mpesa-ref" className="sr-only">
                    M-Pesa Transaction Code
                  </label>
                  <input
                    id="mpesa-ref"
                    type="text"
                    required
                    value={mpesaRef}
                    onChange={(e) => setMpesaRef(e.target.value)}
                    placeholder="Enter M-Pesa Ref (e.g. QKH7890XYZ)"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#C9A227]/40 bg-white text-xs uppercase font-semibold text-[#3D1436] placeholder-[#3D1436]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={recordingPayment || !mpesaRef.trim()}
                  className="btn-gold w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-[#3D1436] whitespace-nowrap shadow-xs disabled:opacity-50"
                >
                  {recordingPayment ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    "Record M-Pesa Payment"
                  )}
                </button>
              </form>
            ) : (
              <div className="p-3 bg-[#EFF4EE] rounded-xl border border-[#7C9473]/30 text-xs font-medium text-[#586E52] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9473]" />
                <span>Payment has been recorded and verified for this order. Thank you!</span>
              </div>
            )}

            {paymentSuccessMsg && (
              <div className="p-3 bg-green-50 text-green-800 rounded-xl text-xs border border-green-200">
                {paymentSuccessMsg}
              </div>
            )}

            {paymentError && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200">
                {paymentError}
              </div>
            )}
          </div>

          {/* WhatsApp Notification Indicator & Quick Chat Link */}
          <div className="mt-6 p-4 rounded-2xl bg-white border border-[#F0D5DD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#3D1436]/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EFF4EE] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-[#7C9473]" />
              </div>
              <div>
                <strong className="text-[#3D1436]">Automated WhatsApp Notification:</strong> When your order status changes to &quot;Baking&quot; or &quot;Out for Delivery&quot;, a notification will automatically be sent to your phone.
              </div>
            </div>
            <a
              href={`https://wa.me/254700000000?text=${encodeURIComponent(
                `Hi Jeycyl Cakes! I placed order #${order.id}. Please confirm receipt.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EFF4EE] text-[#586E52] border border-[#7C9473]/30 hover:bg-[#E2EDE1] transition-colors whitespace-nowrap shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-[#7C9473]" />
              <span>Confirm on WhatsApp</span>
            </a>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-[#FBEEF2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href={`/track?id=${order.id}`}
                className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-[#3D1436] shadow-sm hover:scale-102 transition-transform w-full sm:w-auto"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order Live</span>
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-[#3D1436] bg-[#FBEEF2] hover:bg-[#F3D7E0] transition-colors w-full sm:w-auto"
              >
                <span>Order Another Cake</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link
              href="/#about"
              className="text-xs text-[#3D1436]/70 hover:text-[#3D1436] underline"
            >
              Have questions? Contact our Nairobi Bakery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#C9A227] mb-2" />
          <p className="text-sm text-[#3D1436]">Loading order confirmation...</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
