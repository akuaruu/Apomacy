"use client";

import { useState } from "react";
import Script from "next/script";

interface CheckoutButtonProps {
    grossAmount: number; // Menerima total harga dari halaman checkout
    paymentMethod: string;
}


export default function CheckoutButton({ grossAmount, paymentMethod }: CheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        setIsLoading(true);

        try {
            // 1. Buat Order ID yang unik (Bisa juga di-generate di backend nanti, 
            // tapi untuk sekarang kita generate di frontend pakai timestamp)
            const orderId = `TRX-${Date.now()}`;

            // 2. Tembak API Backend Golang-mu
            // Pastikan URL-nya sesuai dengan routing di router.go milikmu
            const res = await fetch("http://localhost:8080/api/checkout/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_id: orderId,
                    gross_amount: grossAmount,
                    payment_method: paymentMethod, // Kirim ke Golang
                }),
            });
            if (!res.ok) {
                throw new Error("Gagal mengambil token dari backend");
            }

            // 3. Tangkap respons JSON dari payment_handler.go
            const data = await res.json();
            const snapToken = data.token; // Mengambil "token" sesuai dengan c.JSON di Golang

            // 4. Panggil Snap Pop-up dengan Token Asli
            if (window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: function (result: any) {
                        console.log("Payment Success:", result);
                        alert("Pembayaran berhasil diproses!");
                        // TODO: Arahkan ke halaman sukses atau kosongkan CartContext
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