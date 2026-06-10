"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { formatRupiah } from "@/lib/Data";
import { useCart } from "@/context/CartContext";
import CheckoutButton from "@/components/client/CheckoutButton";

const SHIPPING_COST = 15000;
const FREE_SHIPPING_THRESHOLD = 150000;

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, selectedIds, cartTotal } = useCart();
    const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
    const [payment, setPayment] = useState("qris");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        landmark: "",
        pickupName: "",
        pickupPhone: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Auth guard: redirect ke login jika belum punya token ─────────────────
    useEffect(() => {
        const token = Cookies.get("apomacy_token");
        if (!token) {
            router.replace("/login?redirect=/checkout");
        }
    }, [router]);

    const checkoutItems = cartItems.filter((i) => selectedIds.includes(i.product.id));
    const subtotal = cartTotal;
    const shipping =
        method === "pickup"
            ? 0
            : subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
                ? 0
                : SHIPPING_COST;
    const total = subtotal + shipping;

    const orderItems = checkoutItems.map((item) => ({
        id: item.product.id.toString(),
        price: item.product.price,
        quantity: item.quantity,
        name: item.product.name.substring(0, 50),
    }));

    if (shipping > 0) {
        orderItems.push({
            id: "ONGKIR-01",
            price: shipping,
            quantity: 1,
            name: "Biaya Pengiriman",
        });
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === "phone" || name === "pickupPhone") {
            if (value !== "" && !/^[0-9]+$/.test(value)) return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (method === "delivery") {
            if (!formData.name.trim()) newErrors.name = "Nama penerima wajib diisi";
            if (!formData.address.trim()) newErrors.address = "Alamat lengkap wajib diisi";

            if (!formData.phone.trim()) {
                newErrors.phone = "Nomor WhatsApp wajib diisi";
            } else if (formData.phone.length < 11 || formData.phone.length > 13) {
                newErrors.phone = "Nomor HP harus 11-13 digit";
            }
        } else {
            if (!formData.pickupName.trim())
                newErrors.pickupName = "Nama pengambil wajib diisi";

            if (!formData.pickupPhone.trim()) {
                newErrors.pickupPhone = "Nomor HP wajib diisi";
            } else if (
                formData.pickupPhone.length < 11 ||
                formData.pickupPhone.length > 13
            ) {
                newErrors.pickupPhone = "Nomor HP harus 11-13 digit";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <div className="mx-auto max-w-screen-xl px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
                {/* Seksi 1: Metode Penerimaan */}
                <section className="bg-white p-8 rounded-3xl border border-gray-100">
                    <h2 className="text-lg font-black text-apomacy-dark mb-6 flex items-center gap-3">
                        <span className="bg-apomacy-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">
                            1
                        </span>
                        Metode Penerimaan
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                setMethod("delivery");
                                setErrors({});
                            }}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${method === "delivery"
                                    ? "border-apomacy-primary bg-apomacy-primary/5"
                                    : "border-gray-100"
                                }`}
                        >
                            <p className="font-bold text-apomacy-dark">Instant Delivery</p>
                            <p className="text-xs text-outline">1-2 Jam Sampai</p>
                        </button>
                        <button
                            onClick={() => {
                                setMethod("pickup");
                                setErrors({});
                            }}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${method === "pickup"
                                    ? "border-apomacy-primary bg-apomacy-primary/5"
                                    : "border-gray-100"
                                }`}
                        >
                            <p className="font-bold text-apomacy-dark">Ambil di Apotek</p>
                            <p className="text-xs text-outline">Gratis & Tanpa Antre</p>
                        </button>
                    </div>
                </section>

                {/* Seksi 2: Alamat / Info Pickup */}
                <section className="bg-white p-8 rounded-3xl border border-gray-100">
                    {method === "delivery" ? (
                        <>
                            <h2 className="text-lg font-black text-apomacy-dark mb-6 flex items-center gap-3">
                                <span className="bg-apomacy-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">
                                    2
                                </span>
                                Alamat Pengiriman
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Nama Penerima"
                                        className={`w-full p-3 rounded-xl border text-sm focus:outline-none ${errors.name
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-200 focus:ring-apomacy-primary"
                                            }`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Nomor HP (WhatsApp)"
                                        className={`w-full p-3 rounded-xl border text-sm focus:outline-none ${errors.phone
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-200 focus:ring-apomacy-primary"
                                            }`}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Alamat Lengkap (Jalan, No Rumah, RT/RW)"
                                        className={`w-full p-3 rounded-xl border text-sm h-24 focus:outline-none resize-none ${errors.address
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-200 focus:ring-apomacy-primary"
                                            }`}
                                    />
                                    {errors.address && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="text"
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleInputChange}
                                        placeholder="Patokan (Opsional, Contoh: Sebelah Masjid)"
                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-apomacy-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-black text-apomacy-dark mb-6 flex items-center gap-3">
                                <span className="bg-apomacy-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">
                                    2
                                </span>
                                Informasi Pengambilan
                            </h2>
                            <div className="bg-apomacy-bg p-5 rounded-2xl mb-6">
                                <p className="font-bold text-apomacy-dark">
                                    Apomacy Health District
                                </p>
                                <p className="text-sm text-apomacy-muted mt-1">
                                    Jl. Ring Road Utara, Condongcatur, Sleman, Yogyakarta
                                </p>
                                <p className="text-xs text-apomacy-teal font-bold mt-2 italic">
                                    Jam Operasional: 08:00 - 22:00
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="pickupName"
                                        value={formData.pickupName}
                                        onChange={handleInputChange}
                                        placeholder="Nama Pengambil"
                                        className={`w-full p-3 rounded-xl border text-sm focus:outline-none ${errors.pickupName
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-200 focus:ring-apomacy-primary"
                                            }`}
                                    />
                                    {errors.pickupName && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                            {errors.pickupName}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="pickupPhone"
                                        value={formData.pickupPhone}
                                        onChange={handleInputChange}
                                        placeholder="Nomor HP Pengambil"
                                        className={`w-full p-3 rounded-xl border text-sm focus:outline-none ${errors.pickupPhone
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-200 focus:ring-apomacy-primary"
                                            }`}
                                    />
                                    {errors.pickupPhone && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                            {errors.pickupPhone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* Seksi 3: Metode Pembayaran */}
                <section className="bg-white p-8 rounded-3xl border border-gray-100">
                    <h2 className="text-lg font-black text-apomacy-dark mb-6 flex items-center gap-3">
                        <span className="bg-apomacy-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">
                            3
                        </span>
                        Metode Pembayaran
                    </h2>
                    <div className="space-y-3">
                        {[
                            { id: "qris", label: "QRIS (Gopay, ShopeePay, OVO)" },
                            { id: "bca", label: "BCA Virtual Account" },
                            { id: "mandiri", label: "Mandiri Virtual Account" },
                        ].map((p) => (
                            <label
                                key={p.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-sm font-bold text-apomacy-dark">
                                    {p.label}
                                </span>
                                <input
                                    type="radio"
                                    name="payment"
                                    value={p.id}
                                    checked={payment === p.id}
                                    onChange={(e) => setPayment(e.target.value)}
                                    className="h-5 w-5 text-apomacy-primary accent-apomacy-primary"
                                />
                            </label>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sidebar: Detail Pesanan */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 sticky top-24 shadow-sm">
                    <h3 className="font-black text-apomacy-dark mb-6 text-base">
                        Detail Pesanan
                    </h3>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-hide">
                        {checkoutItems.map((item) => (
                            <div key={item.product.id} className="flex gap-3 items-center">
                                <div className="relative w-12 h-12 bg-white border border-outline-variant rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                                    {(item.product as { image?: string }).image ? (
                                        <Image
                                            src={(item.product as { image: string }).image}
                                            alt={item.product.name}
                                            fill
                                            unoptimized
                                            className="object-contain mix-blend-multiply p-1"
                                            sizes="48px"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
                                            <svg
                                                className="h-6 w-6 text-outline-variant"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-xs">
                                    <p className="font-bold text-apomacy-dark line-clamp-1">
                                        {item.product.name}
                                    </p>
                                    <p className="text-outline">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-xs font-bold text-apomacy-dark">
                                    {formatRupiah(item.product.price * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 text-sm border-t border-gray-100 pt-6">
                        <div className="flex justify-between text-on-surface-variant">
                            <span>Subtotal</span>
                            <span className="font-semibold text-on-surface">
                                {formatRupiah(subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-on-surface-variant">
                            <span>Biaya Pengiriman</span>
                            <span
                                className={
                                    shipping === 0
                                        ? "font-bold text-apomacy-teal uppercase"
                                        : "font-semibold text-on-surface"
                                }
                            >
                                {shipping === 0 ? "GRATIS" : formatRupiah(shipping)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-base font-bold text-apomacy-primary pt-4 border-t border-dashed border-gray-100">
                            <span>Total Pembayaran</span>
                            <span className="text-xl font-extrabold">
                                {formatRupiah(total)}
                            </span>
                        </div>
                    </div>

                    {/* ── Teruskan deliveryData ke CheckoutButton ── */}
                    <CheckoutButton
                        grossAmount={total}
                        paymentMethod={payment}
                        items={orderItems}
                        onValidate={validateForm}
                        deliveryData={{
                            method,
                            name: formData.name,
                            phone: formData.phone,
                            address: formData.address,
                            landmark: formData.landmark,
                            pickupName: formData.pickupName,
                            pickupPhone: formData.pickupPhone,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}