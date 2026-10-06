"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  LogOut,
  Plus,
  Upload,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Loader2,
  Cake as CakeIcon,
  ShoppingBag,
  DollarSign,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { Cake, Order, OrderStatus } from "@/lib/types";
import { api, resolveImageUrl } from "@/lib/api";
import { ScallopedCardTrim } from "@/components/FrostingScallop";

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "paid",
  "in_progress",
  "ready",
  "delivered",
  "cancelled",
];

export default function AdminDashboardPage() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"orders" | "cakes">("orders");

  // Auth & General Loading state
  const [authChecking, setAuthChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Cakes State
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [cakesLoading, setCakesLoading] = useState(false);
  const [cakesError, setCakesError] = useState<string | null>(null);
  const [togglingCakeId, setTogglingCakeId] = useState<number | null>(null);

  // Add Cake Modal / Form State
  const [showAddCakeModal, setShowAddCakeModal] = useState(false);
  const [newCakeName, setNewCakeName] = useState("");
  const [newCakeDesc, setNewCakeDesc] = useState("");
  const [newCakePrice, setNewCakePrice] = useState("");
  const [newCakeImageUrl, setNewCakeImageUrl] = useState("");
  const [creatingCake, setCreatingCake] = useState(false);
  const [addCakeError, setAddCakeError] = useState<string | null>(null);

  // Image Upload State
  const [uploadingCakeId, setUploadingCakeId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Load orders (and implicitly check admin auth)
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      if (msg.includes("unauthorized") || msg.includes("401")) {
        router.push("/admin/login");
        return;
      }
      setOrdersError(msg);
    } finally {
      setOrdersLoading(false);
      setAuthChecking(false);
    }
  }, [router]);

  // Load cakes
  const loadCakes = useCallback(async () => {
    setCakesLoading(true);
    setCakesError(null);
    try {
      const data = await api.getCakes();
      setCakes(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load cakes";
      setCakesError(msg);
    } finally {
      setCakesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadCakes();
  }, [loadOrders, loadCakes]);

  // Logout handler
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      router.push("/admin/login");
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order status";
      alert(msg);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle cake availability
  const handleToggleAvailability = async (cake: Cake) => {
    const nextAvailability = !cake.is_available;
    setTogglingCakeId(cake.id);
    try {
      await api.setCakeAvailability(cake.id, nextAvailability);
      setCakes((prev) =>
        prev.map((c) =>
          c.id === cake.id ? { ...c, is_available: nextAvailability } : c
        )
      );
      // Reload available cakes to stay in sync
      loadCakes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle availability";
      alert(msg);
    } finally {
      setTogglingCakeId(null);
    }
  };

  // Handle Create Cake
  const handleCreateCake = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCakeError(null);

    const price = parseFloat(newCakePrice);
    if (!newCakeName.trim()) {
      setAddCakeError("Cake name is required.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setAddCakeError("Please enter a valid price in KES.");
      return;
    }

    setCreatingCake(true);
    try {
      await api.createCake({
        name: newCakeName.trim(),
        description: newCakeDesc.trim() || undefined,
        base_price: price,
        image_url: newCakeImageUrl.trim() || undefined,
      });

      // Reset and close
      setNewCakeName("");
      setNewCakeDesc("");
      setNewCakePrice("");
      setNewCakeImageUrl("");
      setShowAddCakeModal(false);
      loadCakes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create cake";
      setAddCakeError(msg);
    } finally {
      setCreatingCake(false);
    }
  };

  // Handle Image Upload for Cake
  const handleImageFileChange = async (
    cakeId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCakeId(cakeId);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await api.uploadCakeImage(cakeId, file);
      setUploadSuccess(`Image updated successfully for Cake #${cakeId}!`);
      // Update local state
      setCakes((prev) =>
        prev.map((c) => (c.id === cakeId ? { ...c, image_url: res.image_url } : c))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setUploadError(msg);
    } finally {
      setUploadingCakeId(null);
      e.target.value = "";
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-[#FBEEF2]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A227] mb-3" />
        <p className="font-serif text-lg text-[#3D1436]">
          Verifying bakery administrative session...
        </p>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  // Calculate statistics
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed"
  ).length;

  return (
    <div className="py-8 sm:py-12 bg-[#FBEEF2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0D5DD]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#3D1436] flex items-center justify-center text-[#C9A227] shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#C9A227] font-bold">
                  Management Console
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#7C9473]" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D1436]">
                Bakery Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                loadOrders();
                loadCakes();
              }}
              className="p-2.5 rounded-full bg-white border border-[#F0D5DD] text-[#3D1436] hover:bg-[#FFF3F6] transition-colors"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-[#3D1436] hover:bg-[#2A0D25] transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>

        {/* Upload Messages */}
        {uploadSuccess && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center justify-between">
            <span>{uploadSuccess}</span>
            <button
              onClick={() => setUploadSuccess(null)}
              className="text-green-800 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
        {uploadError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <span>{uploadError}</span>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-800 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-[#F0D5DD] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                Total Orders
              </span>
              <span className="font-serif text-3xl font-bold text-[#3D1436] mt-1 block">
                {orders.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBEEF2] flex items-center justify-center text-[#3D1436]">
              <ShoppingBag className="w-6 h-6 text-[#C9A227]" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#F0D5DD] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                Pending Actions
              </span>
              <span className="font-serif text-3xl font-bold text-[#3D1436] mt-1 block">
                {pendingOrdersCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBEEF2] flex items-center justify-center text-[#3D1436]">
              <Clock className="w-6 h-6 text-[#C9A227]" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#F0D5DD] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                Total Revenue
              </span>
              <span className="font-serif text-3xl font-bold text-[#3D1436] mt-1 block">
                KES {totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBEEF2] flex items-center justify-center text-[#3D1436]">
              <DollarSign className="w-6 h-6 text-[#7C9473]" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#F0D5DD] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#3D1436]/60 font-semibold block">
                Active Catalog
              </span>
              <span className="font-serif text-3xl font-bold text-[#3D1436] mt-1 block">
                {cakes.length} Cakes
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBEEF2] flex items-center justify-center text-[#3D1436]">
              <CakeIcon className="w-6 h-6 text-[#C9A227]" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#F0D5DD]">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "orders"
                ? "border-[#C9A227] text-[#3D1436]"
                : "border-transparent text-[#3D1436]/60 hover:text-[#3D1436]"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#C9A227]" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cakes")}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "cakes"
                ? "border-[#C9A227] text-[#3D1436]"
                : "border-transparent text-[#3D1436]/60 hover:text-[#3D1436]"
            }`}
          >
            <CakeIcon className="w-4 h-4 text-[#C9A227]" />
            <span>Cake Catalog Management</span>
          </button>
        </div>

        {/* ================= TAB 1: ORDERS ================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#F0D5DD]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3D1436]">
                <Filter className="w-4 h-4 text-[#C9A227]" />
                <span>Filter by Order Status:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {["all", ...ALL_STATUSES].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                      statusFilter === st
                        ? "bg-[#3D1436] text-white shadow-xs"
                        : "bg-[#FBEEF2] text-[#3D1436]/70 hover:bg-[#F3D7E0]"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {ordersLoading && (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#F0D5DD]">
                <Loader2 className="w-8 h-8 animate-spin text-[#C9A227] mx-auto mb-2" />
                <p className="text-xs text-[#3D1436]">Loading customer orders...</p>
              </div>
            )}

            {!ordersLoading && ordersError && (
              <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-3xl text-xs">
                {ordersError}
              </div>
            )}

            {!ordersLoading && !ordersError && filteredOrders.length === 0 && (
              <div className="p-16 text-center bg-white rounded-3xl border border-[#F0D5DD] space-y-3">
                <div className="text-4xl">📋</div>
                <h3 className="font-serif text-xl font-bold text-[#3D1436]">
                  No orders found
                </h3>
                <p className="text-xs text-[#3D1436]/70 max-w-sm mx-auto">
                  {statusFilter === "all"
                    ? "No customer orders have been placed in the database yet."
                    : `No orders matching status "${statusFilter}".`}
                </p>
              </div>
            )}

            {!ordersLoading && !ordersError && filteredOrders.length > 0 && (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const formattedTotal = new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                    maximumFractionDigits: 0,
                  }).format(order.total_amount);

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-6 border border-[#F0D5DD] shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0">
                        <ScallopedCardTrim className="text-[#3D1436]" />
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
                        {/* Order Header & Summary */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-xl font-bold text-[#3D1436]">
                              Order #{order.id}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FBEEF2] text-[#3D1436]">
                              Customer #{order.customer_id}
                            </span>
                            <span className="text-xs text-[#3D1436]/60">
                              {order.created_at ? new Date(order.created_at).toLocaleString() : ""}
                            </span>
                          </div>

                          <div className="text-xs text-[#3D1436]/80 space-y-1">
                            <p>
                              <strong className="text-[#3D1436]">Delivery Address:</strong>{" "}
                              {order.delivery_address || "None"}
                            </p>
                            {order.notes && (
                              <p>
                                <strong className="text-[#3D1436]">Customer Notes:</strong>{" "}
                                {order.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Selector & Total */}
                        <div className="flex flex-wrap items-center gap-4 bg-[#FBEEF2]/50 p-4 rounded-2xl border border-[#F0D5DD]">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3D1436]/60 block">
                              Order Total
                            </span>
                            <span className="font-serif text-xl font-bold text-[#3D1436]">
                              {formattedTotal}
                            </span>
                          </div>

                          <div className="h-8 w-px bg-[#F0D5DD]" />

                          <div>
                            <label
                              htmlFor={`status-select-${order.id}`}
                              className="text-[10px] uppercase font-bold tracking-wider text-[#3D1436]/60 block mb-1"
                            >
                              Update Status
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                id={`status-select-${order.id}`}
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    order.id,
                                    e.target.value as OrderStatus
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl border border-[#F0D5DD] bg-white text-xs font-bold text-[#3D1436] focus:outline-none focus:ring-2 focus:ring-[#C9A227] disabled:opacity-50"
                              >
                                {ALL_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st.toUpperCase().replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                              {updatingOrderId === order.id && (
                                <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items Details */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#FBEEF2]">
                          <span className="text-xs font-bold text-[#3D1436] block mb-2">
                            Line Items:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {order.items.map((it, idx) => (
                              <div
                                key={it.id || idx}
                                className="p-2.5 rounded-xl bg-[#FBEEF2]/30 border border-[#F0D5DD] text-xs"
                              >
                                <div className="font-semibold text-[#3D1436]">
                                  Cake #{it.cake_id} × {it.quantity}
                                </div>
                                {it.custom_message && (
                                  <div className="text-[11px] text-[#586E52] italic mt-0.5">
                                    ✍️ &quot;{it.custom_message}&quot;
                                  </div>
                                )}
                                <div className="text-[11px] text-[#3D1436]/60 mt-0.5">
                                  KES {it.subtotal || it.unit_price * it.quantity}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: CAKES ================= */}
        {activeTab === "cakes" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#F0D5DD]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#3D1436]">
                  Bakery Catalog Items
                </h2>
                <p className="text-xs text-[#3D1436]/70">
                  Manage cake offerings, toggle customer visibility, and upload appetizing imagery.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCakeModal(true)}
                className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-[#3D1436] shadow-sm hover:scale-102 transition-transform self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add New Cake</span>
              </button>
            </div>

            {/* Note regarding backend availability filter */}
            <div className="p-4 rounded-2xl bg-[#EFF4EE] border border-[#7C9473]/30 text-xs text-[#586E52] flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#7C9473] mt-0.5" />
              <div>
                <strong>Backend Contract Note:</strong> The Go backend endpoint{" "}
                <code className="bg-white px-1 py-0.5 rounded text-[11px]">GET /cakes</code>{" "}
                returns cakes where <code className="bg-white px-1 py-0.5 rounded text-[11px]">is_available = 1</code>.
                Toggling availability to <span className="font-bold">Unavailable</span> will immediately withdraw the cake from public customer browsing.
              </div>
            </div>

            {cakesLoading && (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#F0D5DD]">
                <Loader2 className="w-8 h-8 animate-spin text-[#C9A227] mx-auto mb-2" />
                <p className="text-xs text-[#3D1436]">Loading cakes...</p>
              </div>
            )}

            {!cakesLoading && cakesError && (
              <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-3xl text-xs">
                {cakesError}
              </div>
            )}

            {!cakesLoading && !cakesError && cakes.length === 0 && (
              <div className="p-16 text-center bg-white rounded-3xl border border-[#F0D5DD] space-y-3">
                <div className="text-4xl">🎂</div>
                <h3 className="font-serif text-xl font-bold text-[#3D1436]">
                  No cakes in catalog
                </h3>
                <p className="text-xs text-[#3D1436]/70 max-w-sm mx-auto">
                  Click &quot;Add New Cake&quot; above to create your first cake offering.
                </p>
              </div>
            )}

            {/* Cakes Grid */}
            {!cakesLoading && !cakesError && cakes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cakes.map((cake) => {
                  const formattedPrice = new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                    maximumFractionDigits: 0,
                  }).format(cake.base_price);

                  return (
                    <div
                      key={cake.id}
                      className="bg-white rounded-3xl border border-[#F0D5DD] overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Image & Upload Overlay */}
                        <div className="relative aspect-[16/10] bg-[#FBEEF2] overflow-hidden">
                          {cake.image_url ? (
                            <Image
                              src={resolveImageUrl(cake.image_url)}
                              alt={cake.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              🎂
                            </div>
                          )}

                          {/* Image Upload Input Overlay */}
                          <label
                            className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full bg-[#3D1436]/80 text-white hover:bg-[#3D1436] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-colors shadow-sm"
                            title="Upload new cake photo"
                          >
                            {uploadingCakeId === cake.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A227]" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-[#C9A227]" />
                            )}
                            <span>{uploadingCakeId === cake.id ? "Uploading..." : "Change Image"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="sr-only"
                              disabled={uploadingCakeId === cake.id}
                              onChange={(e) => handleImageFileChange(cake.id, e)}
                            />
                          </label>

                          {/* Status Pill */}
                          <div className="absolute top-2 left-2">
                            {cake.is_available ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7C9473] text-white shadow-xs">
                                Active & Visible
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500 text-white shadow-xs">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-serif text-lg font-bold text-[#3D1436]">
                            {cake.name}
                          </h3>
                          <p className="text-xs text-[#3D1436]/70 mt-1 line-clamp-2">
                            {cake.description || "No description provided."}
                          </p>
                          <div className="font-serif text-lg font-bold text-[#3D1436] mt-3">
                            {formattedPrice}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-[#FBEEF2]/40 border-t border-[#FBEEF2] flex items-center justify-between">
                        <span className="text-xs text-[#3D1436]/60">
                          Cake ID #{cake.id}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(cake)}
                          disabled={togglingCakeId === cake.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            cake.is_available
                              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              : "bg-[#EFF4EE] text-[#586E52] hover:bg-[#E2EDE0] border border-[#7C9473]/30"
                          } disabled:opacity-50`}
                        >
                          {togglingCakeId === cake.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : cake.is_available ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= ADD CAKE MODAL ================= */}
        {showAddCakeModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-cake-title"
          >
            <div
              className="fixed inset-0"
              onClick={() => setShowAddCakeModal(false)}
              aria-hidden="true"
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#F0D5DD] p-6 sm:p-8 z-10 animate-scaleUp">
              <div className="flex items-center justify-between pb-4 border-b border-[#FBEEF2] mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A227] block">
                    Catalog Entry
                  </span>
                  <h3
                    id="add-cake-title"
                    className="font-serif text-2xl font-bold text-[#3D1436]"
                  >
                    Add New Celebration Cake
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCakeModal(false)}
                  className="p-1.5 text-[#3D1436]/60 hover:text-[#3D1436] rounded-full hover:bg-[#FBEEF2]"
                >
                  ✕
                </button>
              </div>

              {addCakeError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                  {addCakeError}
                </div>
              )}

              <form onSubmit={handleCreateCake} className="space-y-4">
                <div>
                  <label
                    htmlFor="cake-name-input"
                    className="block text-xs font-semibold text-[#3D1436] mb-1 uppercase tracking-wider"
                  >
                    Cake Name *
                  </label>
                  <input
                    id="cake-name-input"
                    type="text"
                    required
                    value={newCakeName}
                    onChange={(e) => setNewCakeName(e.target.value)}
                    placeholder="e.g. Salted Caramel Crunch"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/20 text-[#3D1436] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cake-desc-input"
                    className="block text-xs font-semibold text-[#3D1436] mb-1 uppercase tracking-wider"
                  >
                    Description
                  </label>
                  <textarea
                    id="cake-desc-input"
                    rows={2}
                    value={newCakeDesc}
                    onChange={(e) => setNewCakeDesc(e.target.value)}
                    placeholder="e.g. Layers of caramel sponge infused with Maldon sea salt and butterscotch ganache."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/20 text-[#3D1436] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cake-price-input"
                    className="block text-xs font-semibold text-[#3D1436] mb-1 uppercase tracking-wider"
                  >
                    Base Price (KES) *
                  </label>
                  <input
                    id="cake-price-input"
                    type="number"
                    step="50"
                    required
                    value={newCakePrice}
                    onChange={(e) => setNewCakePrice(e.target.value)}
                    placeholder="e.g. 3200"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/20 text-[#3D1436] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cake-image-url-input"
                    className="block text-xs font-semibold text-[#3D1436] mb-1 uppercase tracking-wider"
                  >
                    Initial Image URL (Optional)
                  </label>
                  <input
                    id="cake-image-url-input"
                    type="text"
                    value={newCakeImageUrl}
                    onChange={(e) => setNewCakeImageUrl(e.target.value)}
                    placeholder="https://... or leave empty to upload via file"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/20 text-[#3D1436] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm"
                  />
                  <p className="text-[11px] text-[#3D1436]/60 mt-1">
                    You can also upload a direct image file from your computer immediately after creation.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCakeModal(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#3D1436] hover:bg-[#FBEEF2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCake}
                    className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold text-[#3D1436] shadow-sm disabled:opacity-50"
                  >
                    {creatingCake ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </span>
                    ) : (
                      "Create Cake"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
