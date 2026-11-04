"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  MessageSquare,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Flame,
  PackageCheck,
  Truck,
} from "lucide-react";
import { Order, OrderStatus, Payment } from "@/lib/types";
import { api } from "@/lib/api";
import { ScallopedCardTrim } from "@/components/FrostingScallop";

const TIMELINE_STEPS: Array<{
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    status: "pending",
    label: "Received",
    icon: <Clock className="w-4 h-4" />,
    description: "Order placed & awaiting confirmation",
  },
  {
    status: "confirmed",
    label: "Confirmed",
    icon: <CheckCircle2 className="w-4 h-4" />,
    description: "Bakery accepted your order",
  },
  {
    status: "paid",
    label: "Paid",
    icon: <CreditCard className="w-4 h-4" />,
    description: "Payment recorded & verified",
  },
  {
    status: "in_progress",
    label: "In the Oven",
    icon: <Flame className="w-4 h-4" />,
    description: "Pastry chef is baking & piping",
  },
  {
    status: "ready",
    label: "Ready",
    icon: <PackageCheck className="w-4 h-4" />,
    description: "Boxed with satin ribbon",
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: <Truck className="w-4 h-4" />,
    description: "Handed over to celebration",
  },
];

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("id") || searchParams.get("order");

  const [inputVal, setInputVal] = useState(queryOrderId || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // M-Pesa Recording within Track Order
  const [mpesaRef, setMpesaRef] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const fetchOrder = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setPaymentMsg(null);
    try {
      const [orderData, paymentsData] = await Promise.all([
        api.getOrder(id),
        api.getOrderPayments(id).catch(() => []),
      ]);
      setOrder(orderData);
      setPayments(paymentsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to find order";
      setError(msg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (queryOrderId) {
      const parsed = parseInt(queryOrderId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setInputVal(String(parsed));
        fetchOrder(parsed);
      }
    }
  }, [queryOrderId, fetchOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputVal.trim();
    if (!cleanId) return;
    const num = parseInt(cleanId, 10);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid numeric order number.");
      return;
    }
    router.push(`/track?id=${num}`);
    fetchOrder(num);
  };

  const handleCopyId = () => {
    if (!order) return;
    navigator.clipboard.writeText(String(order.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !mpesaRef.trim()) return;

    setRecordingPayment(true);
    setPaymentMsg(null);
    try {
      await api.recordPayment({
        order_id: order.id,
        amount: order.total_amount,
        method: "mpesa",
        transaction_ref: mpesaRef.trim().toUpperCase(),
      });
      setPaymentMsg({
        type: "success",
        text: `M-Pesa payment (${mpesaRef.trim().toUpperCase()}) logged successfully!`,
      });
      setMpesaRef("");
      fetchOrder(order.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record payment.";
      setPaymentMsg({ type: "error", text: msg });
    } finally {
      setRecordingPayment(false);
    }
  };

  // Timeline step calculation
  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "paid":
        return 2;
      case "in_progress":
        return 3;
      case "ready":
        return 4;
      case "delivered":
        return 5;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === "cancelled";

  const formattedTotal = order
    ? new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }).format(order.total_amount)
    : "KES 0";

  const whatsappMessage = order
    ? encodeURIComponent(
        `Hi Jeycyl Cakes! Inquiring about my order #${order.id} (${order.status.replace("_", " ")}). Total: ${formattedTotal}.`
      )
    : encodeURIComponent("Hi Jeycyl Cakes! I'd like to check on my cake order status.");

  return (
    <div className="min-h-screen bg-[#FBEEF2] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero & Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F0D5DD] shadow-md relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0">
            <ScallopedCardTrim className="text-[#3D1436]" />
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FBEEF2] border border-[#F0D5DD] text-[#3D1436] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Real-Time Kitchen Updates</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3D1436] tracking-tight">
              Track Your Celebration Cake
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#3D1436]/75 max-w-lg mx-auto font-sans">
              Enter your Order ID below to view live baking, packaging, and dispatch progress.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-md mx-auto">
              <div className="flex items-center rounded-full bg-[#FBEEF2]/70 border-2 border-[#F0D5DD] p-1.5 focus-within:border-[#C9A227] focus-within:bg-white transition-all shadow-xs">
                <div className="pl-3.5 text-[#3D1436]/50">
                  <Search className="w-5 h-5 text-[#C9A227]" />
                </div>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter order number (e.g. 42)"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent text-sm font-semibold text-[#3D1436] placeholder-[#3D1436]/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !inputVal.trim()}
                  className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold text-[#3D1436] shrink-0 disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#3D1436]" />
                  ) : (
                    <>
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 border border-[#F0D5DD] shadow-sm text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C9A227] mx-auto" />
            <p className="font-serif text-lg text-[#3D1436]">
              Looking up order #{inputVal} in the bakery log...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-sm text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#3D1436]">Order Not Found</h3>
            <p className="text-sm text-[#3D1436]/70 leading-relaxed">
              We couldn&apos;t locate an order with ID <strong>#{inputVal}</strong>. Please confirm the number on your SMS receipt or contact our bakery staff.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/254700000000?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#EFF4EE] text-[#586E52] border border-[#7C9473]/30"
              >
                <MessageSquare className="w-4 h-4 text-[#7C9473]" />
                <span>Inquire on WhatsApp</span>
              </a>
              <Link
                href="/menu"
                className="btn-gold inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#3D1436]"
              >
                <span>Browse Menu</span>
              </Link>
            </div>
          </div>
        )}

        {/* Order Result Card */}
        {order && !loading && (
          <div className="bg-white rounded-3xl border border-[#F0D5DD] shadow-lg overflow-hidden">
            {/* Card Header */}
            <div className="bg-[#3D1436] p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Order #{order.id}
                  </h2>
                  <button
                    onClick={handleCopyId}
                    type="button"
                    title="Copy Order ID"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FBEEF2] transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#7C9473]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#C9A227]" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#FBEEF2]/70 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString("en-KE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} at {new Date(order.created_at).toLocaleTimeString("en-KE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchOrder(order.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>

                {isCancelled ? (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-200 border border-red-400/40">
                    Cancelled
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#C9A227] text-[#3D1436]">
                    {order.status.replace("_", " ").toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Progress Timeline Tracker */}
              {isCancelled ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">This order was cancelled</h4>
                    <p className="text-xs text-red-700 mt-1">
                      If you believe this was in error or wish to reschedule your cake delivery, please reach out directly to our Nairobi kitchen team.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#3D1436]/60 mb-6">
                    Baking & Delivery Timeline
                  </div>

                  {/* Desktop / Tablet Horizontal Timeline */}
                  <div className="relative">
                    {/* Connecting background line */}
                    <div className="absolute top-5 left-6 right-6 h-1 bg-[#F0D5DD] -z-0 hidden sm:block" />
                    {/* Active progress line */}
                    <div
                      className="absolute top-5 left-6 h-1 bg-[#C9A227] -z-0 transition-all duration-700 hidden sm:block"
                      style={{
                        width: `calc(${(currentStepIdx / (TIMELINE_STEPS.length - 1)) * 100}% - 48px)`,
                      }}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 sm:gap-2 relative z-10">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const isDone = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div
                            key={step.status}
                            className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2 sm:p-0 rounded-xl sm:rounded-none bg-[#FBEEF2]/40 sm:bg-transparent"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all shadow-xs ${
                                isDone
                                  ? "bg-[#7C9473] border-[#7C9473] text-white"
                                  : isCurrent
                                  ? "bg-[#3D1436] border-[#C9A227] text-[#C9A227] ring-4 ring-[#C9A227]/30 scale-110"
                                  : "bg-white border-[#F0D5DD] text-[#3D1436]/40"
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-5 h-5 text-white" />
                              ) : (
                                step.icon
                              )}
                            </div>

                            <div>
                              <div
                                className={`text-xs font-bold tracking-tight ${
                                  isCurrent
                                    ? "text-[#3D1436]"
                                    : isDone
                                    ? "text-[#586E52]"
                                    : "text-[#3D1436]/50"
                                }`}
                              >
                                {step.label}
                              </div>
                              <p className="text-[10px] text-[#3D1436]/60 hidden sm:block leading-tight mt-0.5">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Info Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#FBEEF2]/50 border border-[#F0D5DD]">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                    Total Amount
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#3D1436]">
                    {formattedTotal}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                    Delivery Destination
                  </span>
                  <div className="flex items-start gap-1.5 mt-1 text-xs text-[#3D1436] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                    <span>{order.delivery_address || "Self pick-up at bakery"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                    Special Notes
                  </span>
                  <div className="flex items-start gap-1.5 mt-1 text-xs text-[#3D1436]/80 font-medium italic">
                    <FileText className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                    <span>{order.notes || "None specified"}</span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#3D1436]">
                  Cakes in this Order
                </h3>

                {order.items && order.items.length > 0 ? (
                  <div className="divide-y divide-[#FBEEF2] border border-[#F0D5DD] rounded-2xl overflow-hidden bg-white">
                    {order.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-serif font-bold text-base text-[#3D1436]">
                            Artisan Cake #{item.cake_id}{" "}
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
                  <p className="text-sm text-[#3D1436]/60 italic">No items detailed.</p>
                )}
              </div>

              {/* M-Pesa Payment Status / Payment Form if not paid */}
              {order.status !== "paid" && order.status !== "delivered" && (
                <div className="p-6 rounded-2xl bg-[#FCF7E6] border border-[#C9A227]/30 space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#C9A227]" />
                    <h4 className="font-serif text-lg font-bold text-[#3D1436]">
                      Lipa na M-Pesa Payment
                    </h4>
                  </div>
                  <p className="text-xs text-[#3D1436]/80 leading-relaxed">
                    Have you paid via M-Pesa? Till Number: <strong>987654 (Jeycyl Cakes)</strong> or Paybill <strong>522522</strong> Account: <strong>{order.id}</strong>.
                    Enter your transaction reference code below to instantly confirm your order:
                  </p>

                  <form onSubmit={handleRecordPayment} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="e.g. QKH7890XYZ"
                      value={mpesaRef}
                      onChange={(e) => setMpesaRef(e.target.value)}
                      className="w-full sm:flex-1 px-4 py-2 rounded-xl border border-[#C9A227]/40 text-xs font-bold uppercase text-[#3D1436] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                    <button
                      type="submit"
                      disabled={recordingPayment || !mpesaRef.trim()}
                      className="btn-gold px-6 py-2 rounded-xl text-xs font-bold text-[#3D1436] disabled:opacity-50 whitespace-nowrap shadow-xs"
                    >
                      {recordingPayment ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                        </span>
                      ) : (
                        "Submit M-Pesa Ref"
                      )}
                    </button>
                  </form>

                  {paymentMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs border ${
                        paymentMsg.type === "success"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {paymentMsg.text}
                    </div>
                  )}
                </div>
              )}

              {/* Already Paid Banner */}
              {order.status === "paid" && (
                <div className="p-4 rounded-2xl bg-[#EFF4EE] border border-[#7C9473]/30 text-[#586E52] text-xs font-medium flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#7C9473]" />
                  <span>
                    Payment verified! Your cake is queued in our Nairobi bakery oven schedule.
                  </span>
                </div>
              )}

              {/* Payment Records */}
              {payments.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-[#F0D5DD] text-xs space-y-1.5">
                  <div className="font-bold text-[#3D1436] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Payment Records ({payments.length})</span>
                  </div>
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-[#3D1436]/80 text-[11px] pt-1 border-t border-[#FBEEF2]"
                    >
                      <span>
                        Method: <strong className="uppercase">{p.method}</strong>{" "}
                        {p.transaction_ref && `(Ref: ${p.transaction_ref})`}
                      </span>
                      <span className="font-bold text-[#586E52]">
                        KES {p.amount.toLocaleString()} • {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* WhatsApp & Contact CTA */}
              <div className="pt-6 border-t border-[#FBEEF2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <a
                  href={`https://wa.me/254700000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#EFF4EE] text-[#586E52] border border-[#7C9473]/30 hover:bg-[#E2EDE1] transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#7C9473]" />
                  <span>Chat with Bakery on WhatsApp</span>
                </a>

                <div className="flex items-center gap-3">
                  <Link
                    href="/menu"
                    className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-[#3D1436]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Order Another Cake</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#FBEEF2]">
          <Loader2 className="w-8 h-8 animate-spin text-[#C9A227] mb-2" />
          <p className="text-sm text-[#3D1436]">Loading order tracker...</p>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
