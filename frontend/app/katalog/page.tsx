"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchMockProducts } from "@/lib/dummyData";

export default function KatalogPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchMockProducts();
            setProducts(data as any[]);
            setLoading(false);
        };
        loadData();
    }, []);

    const filteredProducts = products.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white text-apomacy-dark font-sans">
            <header className="bg-white border-b border-apomacy-border py-4 px-4 md:px-8 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/">
                        <h1 className="text-2xl md:text-3xl font-bold text-apomacy-teal cursor-pointer">
                            Apomacy
                        </h1>
                    </Link>
                    <button
                        onClick={() => alert("Simulasi: Berhasil Logout")}
                        className="px-5 py-2 bg-apomacy-danger text-white text-base rounded-full hover:bg-red-600 transition-colors shadow-sm"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <form
                    className="mb-8 flex flex-col sm:flex-row gap-4 justify-center"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <input
                        type="text"
                        placeholder="Cari nama obat..."
                        className="w-full md:w-1/2 px-4 py-2 text-base border border-apomacy-border rounded-lg focus:outline-none focus:ring-2 focus:ring-apomacy-teal bg-white text-apomacy-dark"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-apomacy-teal text-white text-base rounded-lg hover:bg-apomacy-blue transition-colors shadow-sm"
                    >
                        Cari
                    </button>
                </form>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-apomacy-teal"></div>
                        <span className="ml-3 text-base text-apomacy-muted-blue">Mengambil data produk...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <Link href={`/katalog/${product.id}`} key={product.id}>
                                <div className="bg-white border border-apomacy-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full">
                                    <div className="bg-apomacy-light-blue h-48 w-full flex justify-center items-center">
                                        <img src={product.image} alt={product.name} className="h-32 object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <span className="text-xs text-apomacy-blue font-semibold mb-1 uppercase tracking-wider">{product.category}</span>
                                        <h2 className="text-lg font-bold text-apomacy-dark leading-tight mb-2 h-14 overflow-hidden">{product.name}</h2>
                                        <div className="mt-auto flex justify-between items-center border-t border-apomacy-border pt-3">
                                            <span className="text-lg font-bold text-apomacy-teal">Rp {product.price.toLocaleString('id-ID')}</span>
                                            <span className="text-xs text-apomacy-muted-blue">Stok: {product.stock}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-apomacy-muted-blue text-base">
                        Obat yang kamu cari tidak ditemukan.
                    </div>
                )}
            </main>
        </div>
    );
}