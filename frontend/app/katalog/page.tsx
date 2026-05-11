"use client"; // Wajib untuk menggunakan hooks di Next.js App Router

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchMockProducts } from "@/lib/dummyData";

export default function KatalogPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");

    useEffect(() => { //testing API call
        const loadData = async () => {
            const data = await fetchMockProducts();
            setProducts(data as any[]);
            setLoading(false);
        };
        loadData();
    }, []);

    // Filter logika
    const filteredProducts = products.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white text-apomacy-900 font-sans">
            {/* Semantic Header */}
            <header className="bg-apomacy-800 py-6 px-4 md:px-8 shadow-md">
                <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
                    Katalog Obat Apomacy
                </h1>
            </header>

            {/* Semantic Main */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Form Pencarian */}
                <form
                    className="mb-8 flex flex-col sm:flex-row gap-4 justify-center"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <input
                        type="text"
                        placeholder="Cari nama obat..."
                        className="w-full md:w-1/2 px-4 py-2 text-base border border-apomacy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apomacy-500 bg-white text-apomacy-900"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-apomacy-500 text-white text-base rounded-lg hover:bg-apomacy-800 transition-colors shadow-sm"
                    >
                        Cari
                    </button>
                </form>

                {/* Conditional Rendering & Loading Indicator */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-apomacy-500"></div>
                        <span className="ml-3 text-base text-apomacy-800">Mengambil data produk...</span>
                    </div>
                ) : (
                    /* Sistem Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <Link href={`/katalog/${product.id}`} key={product.id}>
                                {/* Efek visual hover, shadow, dan background terang */}
                                <div className="bg-white border border-apomacy-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full">
                                    <div className="bg-apomacy-100 h-48 w-full flex justify-center items-center">
                                        <img src={product.image} alt={product.name} className="h-32 object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <span className="text-xs text-apomacy-500 font-semibold mb-1 uppercase tracking-wider">{product.category}</span>
                                        <h2 className="text-lg font-bold text-apomacy-900 leading-tight mb-2">{product.name}</h2>
                                        <div className="mt-auto flex justify-between items-center">
                                            <span className="text-base font-bold text-apomacy-800">Rp {product.price.toLocaleString('id-ID')}</span>
                                            <span className="text-xs text-gray-500">Stok: {product.stock}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-apomacy-500 text-base">
                        Obat yang kamu cari tidak ditemukan.
                    </div>
                )}
            </main>
        </div>
    );
}