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
  Users,
  Trash2,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react";
import { Cake, Order, OrderStatus, Customer } from "@/lib/types";
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
  const [activeTab, setActiveTab] = useState<"orders" | "cakes" | "customers">("orders");
  const [customerFilterId, setCustomerFilterId] = useState<number | null>(null);

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

  // Customers State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  // Delete Cake State
  const [cakeToDelete, setCakeToDelete] = useState<Cake | null>(null);
  const [deletingCakeId, setDeletingCakeId] = useState<number | null>(null);

  // Add Cake Modal / Form State
  const [showAddCakeModal, setShowAddCakeModal] = useState(false);
  const [newCakeName, setNewCakeName] = useState("");
  const [newCakeDesc, setNewCakeDesc] = useState("");
  const [newCakePrice, setNewCakePrice] = useState("");
  const [newCakeImageUrl, setNewCakeImageUrl] = useState("");
  const [newCakeVariants, setNewCakeVariants] = useState<
    Array<{ size: string; flavor: string; price_modifier: string }>
  >([]);
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

  // Load customers
  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    setCustomersError(null);
    try {
      const data = await api.getAdminCustomers();
      setCustomers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load customers";
      setCustomersError(msg);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadCakes();
    loadCustomers();
  }, [loadOrders, loadCakes, loadCustomers]);

  // Delete cake handler
  const handleConfirmDeleteCake = async () => {
    if (!cakeToDelete) return;
    setDeletingCakeId(cakeToDelete.id);
    try {
      await api.deleteCake(cakeToDelete.id);
      setCakes((prev) => prev.filter((c) => c.id !== cakeToDelete.id));
      setCakeToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete cake";
      alert(msg);
    } finally {
      setDeletingCakeId(null);
    }
  };

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
      const variantsPayload = newCakeVariants
        .filter((v) => v.size.trim() !== "")
        .map((v) => ({
          size: v.size.trim(),
          flavor: v.flavor.trim() || undefined,
          price_modifier: parseFloat(v.price_modifier) || 0,
        }));

      await api.createCake({
        name: newCakeName.trim(),
        description: newCakeDesc.trim() || undefined,
        base_price: price,
        image_url: newCakeImageUrl.trim() || undefined,
        variants: variantsPayload.length > 0 ? variantsPayload : undefined,
      });

      // Reset and close
      setNewCakeName("");
      setNewCakeDesc("");
      setNewCakePrice("");
      setNewCakeImageUrl("");
      setNewCakeVariants([]);
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
    if (customerFilterId !== null && o.customer_id !== customerFilterId) {
      return false;
    }
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
                loadCustomers();
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
        <div className="flex items-center gap-3 border-b border-[#F0D5DD] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
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
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "cakes"
                ? "border-[#C9A227] text-[#3D1436]"
                : "border-transparent text-[#3D1436]/60 hover:text-[#3D1436]"
            }`}
          >
            <CakeIcon className="w-4 h-4 text-[#C9A227]" />
            <span>Cake Catalog Management</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "customers"
                ? "border-[#C9A227] text-[#3D1436]"
                : "border-transparent text-[#3D1436]/60 hover:text-[#3D1436]"
            }`}
          >
            <Users className="w-4 h-4 text-[#C9A227]" />
            <span>Customers Directory ({customers.length})</span>
          </button>
        </div>

        {/* Customer Filter Notice in Orders Tab */}
        {activeTab === "orders" && customerFilterId !== null && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FCF7E6] border border-[#C9A227]/40 text-xs text-[#8B6E13]">
            <span className="font-semibold">
              🔍 Showing orders placed by Customer #{customerFilterId}
            </span>
            <button
              onClick={() => setCustomerFilterId(null)}
              className="font-bold underline text-[#3D1436] hover:text-black cursor-pointer"
            >
              Clear Customer Filter (Show All)
            </button>
          </div>
        )}

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

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCakeToDelete(cake)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                            title="Delete cake from catalog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>

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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: CUSTOMERS ================= */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#F0D5DD]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#3D1436]">
                  Registered Customer Directory
                </h2>
                <p className="text-xs text-[#3D1436]/70">
                  Customers registered through order placement and direct lookup.
                </p>
              </div>

              <div className="text-xs font-semibold text-[#8B6E13] bg-[#FCF7E6] border border-[#C9A227]/30 px-3 py-1.5 rounded-full">
                {customers.length} Total Customers
              </div>
            </div>

            {customersLoading && (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#F0D5DD]">
                <Loader2 className="w-8 h-8 animate-spin text-[#C9A227] mx-auto mb-2" />
                <p className="text-xs text-[#3D1436]">Loading customers...</p>
              </div>
            )}

            {!customersLoading && customersError && (
              <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-3xl text-xs flex items-center justify-between">
                <span>{customersError}</span>
                <button
                  onClick={loadCustomers}
                  className="font-bold underline text-red-900 ml-4"
                >
                  Retry
                </button>
              </div>
            )}

            {!customersLoading && !customersError && customers.length === 0 && (
              <div className="p-16 text-center bg-white rounded-3xl border border-[#F0D5DD] space-y-3">
                <Users className="w-12 h-12 text-[#C9A227] mx-auto opacity-70" />
                <h3 className="font-serif text-xl font-bold text-[#3D1436]">
                  No customers registered yet
                </h3>
                <p className="text-xs text-[#3D1436]/70 max-w-sm mx-auto">
                  When customers place celebration cake orders, their contact and address profiles are safely logged here.
                </p>
              </div>
            )}

            {!customersLoading && !customersError && customers.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#F0D5DD] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#3D1436]">
                    <thead className="bg-[#FBEEF2]/70 text-[#3D1436] font-bold border-b border-[#F0D5DD]">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">Customer</th>
                        <th className="py-3.5 px-4">Contact Phone</th>
                        <th className="py-3.5 px-4">Email Address</th>
                        <th className="py-3.5 px-4">Delivery Address</th>
                        <th className="py-3.5 px-4">Registered Date</th>
                        <th className="py-3.5 px-4 text-right">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FBEEF2]">
                      {customers.map((c) => {
                        const customerOrdersCount = orders.filter(
                          (o) => o.customer_id === c.id
                        ).length;

                        return (
                          <tr key={c.id} className="hover:bg-[#FFF3F6] transition-colors">
                            <td className="py-4 px-4 sm:px-6">
                              <div className="font-bold text-sm text-[#3D1436]">
                                {c.name}
                              </div>
                              <span className="text-[11px] text-[#3D1436]/50">
                                Customer ID #{c.id}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <a
                                href={`tel:${c.phone}`}
                                className="inline-flex items-center gap-1.5 text-xs text-[#586E52] hover:underline font-semibold"
                              >
                                <Phone className="w-3.5 h-3.5 text-[#7C9473]" />
                                <span>{c.phone}</span>
                              </a>
                            </td>
                            <td className="py-4 px-4">
                              {c.email ? (
                                <a
                                  href={`mailto:${c.email}`}
                                  className="inline-flex items-center gap-1.5 text-xs text-[#3D1436]/80 hover:underline"
                                >
                                  <Mail className="w-3.5 h-3.5 text-[#C9A227]" />
                                  <span>{c.email}</span>
                                </a>
                              ) : (
                                <span className="text-[#3D1436]/40 italic">Not provided</span>
                              )}
                            </td>
                            <td className="py-4 px-4 max-w-xs">
                              {c.address ? (
                                <div className="flex items-start gap-1 text-xs text-[#3D1436]/80">
                                  <MapPin className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                                  <span className="truncate">{c.address}</span>
                                </div>
                              ) : (
                                <span className="text-[#3D1436]/40 italic">—</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-xs text-[#3D1436]/60">
                              {c.created_at
                                ? new Date(c.created_at).toLocaleDateString("en-KE", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomerFilterId(c.id);
                                  setActiveTab("orders");
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FBEEF2] text-[#3D1436] hover:bg-[#F3D7E0] transition-colors whitespace-nowrap"
                              >
                                <span>View Orders</span>
                                <span className="bg-[#C9A227] text-[#3D1436] rounded-full px-1.5 py-0.2 text-[10px]">
                                  {customerOrdersCount}
                                </span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= DELETE CAKE CONFIRMATION MODAL ================= */}
        {cakeToDelete && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0"
              onClick={() => setCakeToDelete(null)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#F0D5DD] p-6 z-10 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#3D1436]">
                  Delete &quot;{cakeToDelete.name}&quot;?
                </h3>
                <p className="text-xs text-[#3D1436]/70 mt-1">
                  This will permanently delete Cake #{cakeToDelete.id} from your catalog. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCakeToDelete(null)}
                  disabled={deletingCakeId !== null}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#3D1436] hover:bg-[#FBEEF2]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCake}
                  disabled={deletingCakeId !== null}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  {deletingCakeId !== null ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Yes, Delete Cake"
                  )}
                </button>
              </div>
            </div>
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

                {/* Variant Builder */}
                <div className="pt-3 border-t border-[#FBEEF2]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-[#3D1436] uppercase tracking-wider">
                      Size & Flavour Variants <span className="font-normal text-[#3D1436]/60">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewCakeVariants((prev) => [
                          ...prev,
                          { size: "", flavor: "", price_modifier: "0" },
                        ])
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#C9A227] hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variant</span>
                    </button>
                  </div>

                  {newCakeVariants.length > 0 && (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {newCakeVariants.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Size (e.g. 1kg)"
                            value={v.size}
                            onChange={(e) =>
                              setNewCakeVariants((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, size: e.target.value } : item
                                )
                              )
                            }
                            className="w-1/3 px-2.5 py-1.5 rounded-lg border border-[#F0D5DD] text-xs bg-[#FBEEF2]/20 focus:bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Flavour (e.g. Vanilla)"
                            value={v.flavor}
                            onChange={(e) =>
                              setNewCakeVariants((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, flavor: e.target.value } : item
                                )
                              )
                            }
                            className="w-1/3 px-2.5 py-1.5 rounded-lg border border-[#F0D5DD] text-xs bg-[#FBEEF2]/20 focus:bg-white"
                          />
                          <input
                            type="number"
                            placeholder="+/- KES"
                            step="50"
                            value={v.price_modifier}
                            onChange={(e) =>
                              setNewCakeVariants((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, price_modifier: e.target.value } : item
                                )
                              )
                            }
                            className="w-1/4 px-2.5 py-1.5 rounded-lg border border-[#F0D5DD] text-xs bg-[#FBEEF2]/20 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewCakeVariants((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-gray-400 hover:text-red-500 p-1 text-xs"
                            title="Remove variant"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
