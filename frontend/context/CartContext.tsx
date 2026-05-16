"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem } from "@/lib/index";

interface CartContextType {
    cartItems: CartItem[];
    selectedIds: string[];
    addToCart: (product: Product) => void;
    updateQuantity: (productId: string, delta: number) => void;
    removeItem: (productId: string) => void;
    toggleSelect: (productId: string) => void;
    toggleSelectAll: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem("apomacy_cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed) && (parsed.length === 0 || parsed[0].product)) {
                    setCartItems(parsed);
                    setSelectedIds(parsed.map((item: CartItem) => item.product.id));
                } else {
                    localStorage.removeItem("apomacy_cart");
                }
            } catch (e) {
                localStorage.removeItem("apomacy_cart");
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("apomacy_cart", JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded]);

    const addToCart = (product: Product) => {
        setCartItems((prev) => {
            const exists = prev.find((i) => i.product.id === product.id);
            if (exists) {
                return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            setSelectedIds(prevIds => [...prevIds, product.id]);
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
    };

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(i => i.product.id !== id));
        setSelectedIds(prev => prev.filter(currId => currId !== id));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === cartItems.length ? [] : cartItems.map(i => i.product.id));
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) =>
        selectedIds.includes(item.product.id) ? sum + (item.product.price * item.quantity) : sum, 0
    );

    return (
        <CartContext.Provider value={{ cartItems, selectedIds, addToCart, updateQuantity, removeItem, toggleSelect, toggleSelectAll, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
};