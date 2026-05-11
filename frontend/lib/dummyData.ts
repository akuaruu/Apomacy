export const mockProducts = [
    { id: 1, name: "Paracetamol 500mg", category: "Demam", price: 15000, stock: 100, image: "https://via.placeholder.com/300x300.png?text=Paracetamol" },
    { id: 2, name: "Amoxicillin 250mg", category: "Antibiotik", price: 25000, stock: 50, image: "https://via.placeholder.com/300x300.png?text=Amoxicillin" },
    { id: 3, name: "Vitamin C 1000mg", category: "Vitamin", price: 45000, stock: 200, image: "https://via.placeholder.com/300x300.png?text=Vitamin+C" },
    { id: 4, name: "Ibuprofen 400mg", category: "Nyeri", price: 20000, stock: 80, image: "https://via.placeholder.com/300x300.png?text=Ibuprofen" },
    { id: 5, name: "Antasida Doen", category: "Pencernaan", price: 12000, stock: 150, image: "https://via.placeholder.com/300x300.png?text=Antasida" },
    { id: 6, name: "Loperamide 2mg", category: "Pencernaan", price: 18000, stock: 60, image: "https://via.placeholder.com/300x300.png?text=Loperamide" },
    { id: 7, name: "Cetirizine 10mg", category: "Alergi", price: 22000, stock: 90, image: "https://via.placeholder.com/300x300.png?text=Cetirizine" },
    { id: 8, name: "Omeprazole 20mg", category: "Pencernaan", price: 30000, stock: 40, image: "https://via.placeholder.com/300x300.png?text=Omeprazole" },
    { id: 9, name: "Salep Hydrocortisone", category: "Kulit", price: 35000, stock: 30, image: "https://via.placeholder.com/300x300.png?text=Hydrocortisone" },
    { id: 10, name: "Sirup OBH Combi", category: "Batuk", price: 28000, stock: 120, image: "https://via.placeholder.com/300x300.png?text=OBH+Combi" },
    { id: 11, name: "Minyak Kayu Putih", category: "P3K", price: 21000, stock: 300, image: "https://via.placeholder.com/300x300.png?text=Kayu+Putih" },
    { id: 12, name: "Masker Medis 3Ply", category: "Alat Kesehatan", price: 50000, stock: 500, image: "https://via.placeholder.com/300x300.png?text=Masker" },
];

export const fetchMockProducts = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockProducts);
        }, 1500); // Loading selama 1.5 detik
    });
};

export const fetchMockProductById = (id: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const product = mockProducts.find((p) => p.id === id);
            resolve(product);
        }, 1000);
    });
};