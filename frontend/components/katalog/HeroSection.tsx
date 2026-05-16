"use client";

const HERO_IMAGE_URL =
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000";

export default function HeroSection() {
    return (
        <div className="bg-apomacy-ice rounded-xl overflow-hidden flex flex-col md:flex-row relative">
            {/* Text Content */}
            <div className="flex-1 p-12 flex flex-col justify-center z-10">
                <span className="inline-block bg-white text-discount-red font-bold text-sm px-3 py-1 rounded-full w-max mb-6">
                    -20% OFF WEEKEND SALE
                </span>
                <h1 className="text-apomacy-dark font-banner-hero-lg text-5xl mb-4 max-w-lg font-black">
                    Premium Healthcare &amp; Wellness Essentials
                </h1>
                <p className="text-apomacy-dark opacity-80 text-lg mb-8 max-w-md">
                    Discover top-tier medical supplies, daily vitamins, and personal care
                    products trusted by professionals.
                </p>
                <button className="bg-primary-container text-white px-8 py-4 rounded-lg font-button-cta text-sm w-max hover:bg-primary transition-colors font-bold">
                    SHOP NOW
                </button>
            </div>

            {/* Background Image Panel */}
            <div className="flex-1 relative min-h-[400px]">
                <div
                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
                    style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
                />
            </div>

            {/* Carousel Dots */}
            <div className="absolute bottom-6 left-12 flex gap-2 z-20">
                <button className="w-3 h-3 rounded-full bg-primary-container" aria-label="Slide 1" />
                <button className="w-3 h-3 rounded-full bg-white opacity-50 hover:opacity-100 transition-opacity" aria-label="Slide 2" />
                <button className="w-3 h-3 rounded-full bg-white opacity-50 hover:opacity-100 transition-opacity" aria-label="Slide 3" />
            </div>

            {/* Prev / Next Controls */}
            <button
                aria-label="Previous slide"
                className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-primary-container hover:bg-white transition-colors z-20 shadow-sm"
            >
                <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
                aria-label="Next slide"
                className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-primary-container hover:bg-white transition-colors z-20 shadow-sm"
            >
                <span className="material-symbols-outlined">chevron_right</span>
            </button>
        </div>
    );
}