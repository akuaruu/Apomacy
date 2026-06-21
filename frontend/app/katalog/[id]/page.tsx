"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/Data";
import ProductCard, { ExtendedProduct } from "@/components/shared/ProductCard";
import api from "@/lib/api";

interface ProductDetail {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    inStock: boolean;
    description: string;
    dosage: string;
    specifications: Record<string, string | number>;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { addToCart } = useCart();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ExtendedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (type: 'plus' | 'minus') => {
        if (type === 'plus') {
            setQuantity(prev => prev + 1);
        } else if (type === 'minus' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart_related = (relProduct: ExtendedProduct) => {
        if (relProduct) {
            setQuantity(1)

            addToCart(relProduct as any);
        }

    }

    const handleAddToCart = (product: ExtendedProduct) => {

        if (product) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product as any);
            }
        }
    };


    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/obat/${id}`);
                const data = res.data?.data || res.data;

                const currentCategory = data.kategori && data.kategori.length > 0 ? data.kategori[0] : data.jenis_obat;

                const detail: ProductDetail = {
                    id: data.id_obat.toString(),
                    name: data.nama_obat,
                    price: data.harga_jual,
                    category: data.kategori && data.kategori.length > 0 ? data.kategori.join(", ") : data.jenis_obat,
                    image: data.gambar_produk,
                    inStock: data.stok > 0,
                    description: data.deskripsi,
                    dosage: data.dosis_pemakaian,
                    specifications: {
                        "Jenis Obat": data.jenis_obat,
                        "Bentuk": data.bentuk_obat,
                        "Satuan": data.satuan,
                        "Komposisi": data.komposisi
                    }
                };

                setProduct(detail);

                const relatedRes = await api.get("/obat");
                let relatedData = relatedRes.data?.data || relatedRes.data;
                if (Array.isArray(relatedData)) {
                    const mappedRelated: ExtendedProduct[] = relatedData
                        .filter((item: any) => item.id_obat.toString() !== id)
                        .filter((item: any) => {
                            const itemCat = item.kategori && item.kategori.length > 0 ? item.kategori[0] : item.jenis_obat;
                            return itemCat === currentCategory;
                        })
                        .slice(0, 5)
                        .map((item: any) => ({
                            id: item.id_obat.toString(),
                            name: item.nama_obat,
                            price: item.harga_jual,
                            image: item.gambar_produk,
                            category: item.kategori && item.kategori.length > 0 ? item.kategori[0] : item.jenis_obat,
                            unit: item.satuan,
                            inStock: item.stok > 0
                        }));
                    setRelatedProducts(mappedRelated);
                }

            } catch (error) {
                console.error("Gagal mengambil data produk");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-apomacy-bg">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-apomacy-bg border-t-apomacy-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-apomacy-bg text-center">
                <h1 className="text-2xl font-bold text-apomacy-dark">Produk tidak ditemukan</h1>
                <Link href="/katalog" className="mt-4 text-apomacy-primary hover:underline">
                    Kembali ke Katalog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-apomacy-bg py-8">
            <main className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-container-low">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <div className="mb-2 text-sm font-bold text-apomacy-teal">
                                {product.category}
                            </div>
                            <h1 className="mb-4 text-3xl font-black text-apomacy-dark sm:text-4xl">
                                {product.name}
                            </h1>
                            <div className="mb-6 flex items-end gap-3">
                                <span className="text-4xl font-extrabold text-apomacy-primary">
                                    {formatRupiah(product.price)}
                                </span>
                            </div>

                            <div className="mb-8">
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`px-4 py-2 font-bold text-sm ${activeTab === 'description' ? 'border-b-2 border-apomacy-primary text-apomacy-primary' : 'text-outline-variant hover:text-apomacy-dark'}`}
                                    >
                                        Deskripsi
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('specifications')}
                                        className={`px-4 py-2 font-bold text-sm ${activeTab === 'specifications' ? 'border-b-2 border-apomacy-primary text-apomacy-primary' : 'text-outline-variant hover:text-apomacy-dark'}`}
                                    >
                                        Spesifikasi
                                    </button>
                                </div>
                                <div className="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                                    {activeTab === 'description' ? (
                                        <div>
                                            <p className="mb-4">{product.description}</p>
                                            {product.dosage && (
                                                <div className="mt-6 rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                                                    <h4 className="font-bold text-apomacy-dark mb-2 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-apomacy-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Dosis & Aturan Pakai:
                                                    </h4>
                                                    <p>{product.dosage}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {Object.entries(product.specifications).map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-3 border-b border-gray-100 py-2">
                                                    <span className="font-medium text-outline">{key}</span>
                                                    <span className="col-span-2 text-apomacy-dark">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex h-12 w-32 items-center justify-between rounded-lg border border-outline-variant px-2">
                                    <button
                                        onClick={() => handleQuantityChange('minus')}
                                        className="flex h-8 w-8 items-center justify-center rounded text-apomacy-dark hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-apomacy-dark">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange('plus')}
                                        className="flex h-8 w-8 items-center justify-center rounded text-apomacy-dark hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={!product.inStock}
                                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-apomacy-primary px-8 font-bold text-white transition-all hover:bg-apomacy-dark active:scale-95 disabled:cursor-not-allowed disabled:bg-outline-variant"
                                >
                                    Tambahkan ke Keranjang
                                </button>
                            </div>
                        </div>
                    </div>

                    {relatedProducts.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <h2 className="text-xl font-black text-apomacy-dark mb-6">Related Products</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {relatedProducts.map((relProduct) => (
                                    <ProductCard
                                        key={relProduct.id}
                                        product={relProduct}
                                        onAddToCart={() => handleAddToCart_related(relProduct)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}