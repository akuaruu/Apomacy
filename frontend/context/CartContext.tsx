"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Product, CartItem } from "@/lib/index";

interface CartContextType {
    cartItems: CartItem[];
    selectedIds: string[];
    addToCart: (product: Product) => void;
    updateQuantity: (productId: string, delta: number) => void;
    removeItem: (productId: string) => void;
    toggleSelect: (productId: string) => void;
    toggleSelectAll: () => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

interface MyTokenPayload {
    id_user?: number;
    user_id?: number;
    id?: number;
    role?: string;
    exp?: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = Cookies.get("apomacy_token");
        let currentUserId = null;

        if (token) {
            try {
                const decoded = jwtDecode<MyTokenPayload>(token);
                const extractedId = decoded.id_user || decoded.user_id || decoded.id;
                if (extractedId) {
                    currentUserId = String(extractedId);
                    setUserId(currentUserId);
                }
            } catch (e) {
                setUserId(null);
            }
        } else {
            setUserId(null);
        }

        if (currentUserId) {
            const storageKey = `apomacy_cart_${currentUserId}`;
            const savedCart = localStorage.getItem(storageKey);
            if (savedCart) {
                try {
                    const parsed = JSON.parse(savedCart);
                    if (Array.isArray(parsed) && (parsed.length === 0 || parsed[0].product)) {
                        setCartItems(parsed);
                        setSelectedIds(parsed.map((item: CartItem) => item.product.id));
                    } else {
                        localStorage.removeItem(storageKey);
                    }
                } catch (e) {
                    localStorage.removeItem(storageKey);
                }
            }
        } else {
            setCartItems([]);
            setSelectedIds([]);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded && userId) {
            const storageKey = `apomacy_cart_${userId}`;
            localStorage.setItem(storageKey, JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded, userId]);

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

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem("apomacy_cart");
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) =>
        selectedIds.includes(item.product.id) ? sum + (item.product.price * item.quantity) : sum, 0
    );

    return (
        <CartContext.Provider value={{ cartItems, selectedIds, addToCart, updateQuantity, removeItem, toggleSelect, toggleSelectAll, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
};