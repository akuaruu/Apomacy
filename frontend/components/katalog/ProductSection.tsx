import ProductCard, { ProductCardProps } from "@/components/shared/ProductCard";

interface ProductSectionProps {
    title: string;
    products: ProductCardProps[];
    /** Optional right-side annotation, e.g. "Showing 1-25 of 142" */
    annotation?: string;
    /** Show the Load More button */
    showLoadMore?: boolean;
    onLoadMore?: () => void;
}

export default function ProductSection({
    title,
    products,
    annotation,
    showLoadMore = false,
    onLoadMore,
}: ProductSectionProps) {
    return (
        <section className="w-full flex flex-col gap-6">
            {/* Section Header */}
            <div className="flex justify-between items-end border-b border-surface-variant pb-2">
                <h2 className="font-section-title text-section-title text-primary font-bold text-xl">
                    {title}
                </h2>
                {annotation && (
                    <span className="text-sm text-outline">{annotation}</span>
                )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-card-gap">
                {products.map((product, i) => (
                    <ProductCard key={`${title}-${i}`} {...product} />
                ))}
            </div>

            {/* Load More */}
            {showLoadMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={onLoadMore}
                        className="px-8 py-3 bg-surface-container-lowest border border-outline-variant text-primary font-button-cta text-button-cta rounded hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm font-bold"
                    >
                        LOAD MORE PRODUCTS
                    </button>
                </div>
            )}
        </section>
    );
}