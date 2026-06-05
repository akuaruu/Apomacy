"use client";

import { useState } from "react";
import Script from "next/script";

interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
}

interface CheckoutButtonProps {
    grossAmount: number;
    paymentMethod: string;
    items: ItemDetail[];
    onValidate: () => boolean;
}

export default function CheckoutButton({ grossAmount, paymentMethod, items, onValidate }: CheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        if (!onValidate()) {
            return;
        }

        setIsLoading(true);

        try {
            const orderId = `TRX-${Date.now()}`;

            const res = await fetch("http://localhost:8080/api/checkout/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: orderId,
                    gross_amount: grossAmount,
                    payment_method: paymentMethod,
                    items: items,
                }),
            });

            if (!res.ok) {
                throw new Error("Gagal mengambil token dari backend");
            }

            const data = await res.json();
            const snapToken = data.token;

            if (window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: function (result: any) {
                        console.log("Payment Success:", result);
                        alert("Pembayaran berhasil diproses!");
                    },
                    onPending: function (result: any) {
                        console.log("Payment Pending:", result);
                        window.location.href = `/pembayaran/pending?order_id=${result.order_id}`;
                    },
                    onError: function (result: any) {
                        console.log("Payment Error:", result);
                        alert("Pembayaran gagal atau kadaluarsa.");
                    },
                    onClose: function () {
                        console.log("Pop-up Closed");
                        alert("Pop-up ditutup tanpa menyelesaikan pembayaran.");
                    }
                });
            } else {
                console.error("Snap script belum termuat.");
                alert("Sistem pembayaran sedang memuat, silakan coba lagi.");
            }
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Terjadi kesalahan komunikasi dengan server Apomacy.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key="ISI_DENGAN_CLIENT_KEY_SAYA"
                strategy="lazyOnload"
            />

            <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-apomacy-primary text-white py-4 rounded-2xl font-bold mt-8 hover:bg-apomacy-dark transition-all shadow-lg shadow-apomacy-primary/20 tracking-wider uppercase text-sm disabled:opacity-50"
            >
                {isLoading ? "Menyiapkan Pembayaran..." : "Selesaikan Pesanan"}
            </button>
        </>
    );
}