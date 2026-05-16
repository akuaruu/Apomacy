export interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    dosage?: string;
    badge?: "sale" | "new" | "popular";
    inStock: boolean;
    description?: string;
    benefits?: string[];
}

export interface Category {
    id: string;
    name: string;
    count: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface ShippingAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
}