import React from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, Thermometer, Heart, Package, CheckCircle2, Shield, PieChart, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-linear-to-br from-[#f8faff] to-[#e6f2fb] px-10 py-16 md:py-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-[#e6f2fb] text-[#052659] font-semibold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider">
              OUR JOURNEY
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#021024] leading-tight">
              Redefining Care in the Digital Age
            </h1>
            <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
              At Apomacy, we believe healthcare should be as seamless as a heartbeat. We're bridging the gap between clinical excellence and digital convenience.
            </p>
            <div className="pt-2">
              <button className="bg-[#021024] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-[#052659] transition-colors shadow-lg">
                Explore Our Mission <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 relative w-full flex justify-center md:justify-end">
            <div className="w-full max-w-md h-[450px] rounded-3xl overflow-hidden relative shadow-lg">
              <img src="/image/hero_pharmacist.png" alt="Pharmacist" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-8 -ml-16 md:left-4 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 max-w-[200px]">
              <h4 className="text-2xl font-bold text-[#021024]">10k+</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">Prescriptions delivered with precision and care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Core Values */}
      <section className="px-10 py-20 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[#021024]">Our Vision & Core Values</h2>
            <p className="text-gray-500 text-sm">
              Guided by a commitment to integrity, innovation, and empathy, we're building a healthier future for everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Accessibility First */}
            <div className="md:col-span-2 bg-[#e6f2fb] rounded-[2rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group">
              <div className="space-y-4 relative z-10">
                <Eye size={24} className="text-[#052659]" />
                <h3 className="text-2xl font-bold text-[#021024]">Accessibility First</h3>
                <p className="text-sm text-gray-600 max-w-md leading-relaxed">
                  We believe quality healthcare shouldn't be a luxury of location. By digitizing the pharmacy experience, we bring essential care to rural and urban communities alike with zero friction.
                </p>
              </div>
              <div className="mt-8 relative z-10 flex justify-center">
                 <div className="w-64 h-32 bg-white rounded-t-3xl border-t-8 border-x-8 border-[#021024] flex justify-center overflow-hidden relative shadow-lg">
                   <div className="w-1/3 h-4 bg-[#021024] rounded-b-xl absolute top-0"></div>
                   <div className="mt-6 w-full px-4 flex flex-col gap-2">
                      <div className="w-full h-24 bg-[#e6f2fb] rounded-lg flex items-center justify-center">
                         <Users className="text-[#7DA0CA]" size={32} />
                      </div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Clinical Precision */}
            <div className="bg-[#021024] rounded-[2rem] p-8 md:p-10 flex flex-col justify-between text-white space-y-8">
               <div className="space-y-4">
                 <Thermometer size={24} className="text-[#7DA0CA]" />
                 <h3 className="text-2xl font-bold">Clinical Precision</h3>
                 <p className="text-sm text-gray-300 leading-relaxed">
                   Every prescription is verified through a rigorous double-check protocol, blending AI-assisted accuracy with expert human oversight to ensure total safety.
                 </p>
               </div>
               <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                 <h4 className="font-bold text-white text-sm">99.9% Accuracy</h4>
                 <p className="text-[10px] text-gray-400 mt-1">in prescription delivery</p>
               </div>
            </div>

            {/* Empathetic Support */}
            <div className="bg-[#a7c5ea] rounded-[2rem] p-8 md:p-10 flex flex-col space-y-4 text-[#021024]">
               <Heart size={24} className="text-[#021024]" />
               <h3 className="text-2xl font-bold">Empathetic Support</h3>
               <p className="text-sm leading-relaxed text-gray-800">
                 Beyond logistics, we provide a human touch. Our licensed pharmacists are available for virtual consultations, offering warmth and expertise when you need it most.
               </p>
            </div>

            {/* Smarter Inventory */}
            <div className="md:col-span-2 bg-[#f4f8fb] rounded-[2rem] p-8 md:p-10 flex items-center justify-between group">
               <div className="space-y-4 max-w-md">
                 <h3 className="text-2xl font-bold text-[#021024]">Smarter Inventory</h3>
                 <p className="text-sm text-gray-500 leading-relaxed">
                   Real-time tracking and predictive stocking mean we have what you need, before you even realize you're running low.
                 </p>
               </div>
               <div className="hidden md:flex items-center justify-center p-6 text-gray-300 group-hover:text-[#a7c5ea] transition-colors">
                  <Package size={64} strokeWidth={1.5} />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Apomacy? */}
      <section className="px-10 py-24 bg-linear-to-br from-[#f8faff] to-[#e6f2fb]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-10">
            <h2 className="text-3xl font-bold text-[#021024]">Why Choose Apomacy?</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e6f2fb] text-[#052659] flex items-center justify-center shrink-0">
                   <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#021024] mb-1 text-sm">Doorstep Delivery</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Same-day shipping for urgent medications and scheduled refills for chronic care.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e6f2fb] text-[#052659] flex items-center justify-center shrink-0">
                   <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#021024] mb-1 text-sm">Secure Data Vault</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Your health records are protected with bank-grade encryption and strict HIPAA compliance.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e6f2fb] text-[#052659] flex items-center justify-center shrink-0">
                   <PieChart size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#021024] mb-1 text-sm">Transparent Pricing</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">No hidden fees. We work with all major insurers to ensure you get the best possible rates.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="w-full h-[350px] rounded-3xl overflow-hidden shadow-2xl relative">
              <img src="/image/smart_locker.png" alt="Secure Tech" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Experts */}
      <section className="px-10 py-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[#021024]">Meet Our Experts</h2>
            <p className="text-gray-500 text-sm">
              The brilliant minds working tirelessly to transform your healthcare experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
             {/* Card 1 */}
             <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               <div className="h-48 w-full bg-gray-200">
                 <img src="/image/expert_sarah.png" alt="Sarah Chen" className="w-full h-full object-cover" />
               </div>
               <div className="p-5 space-y-3">
                 <div>
                   <h4 className="font-bold text-[#021024] text-sm">Dr. Sarah Chen</h4>
                   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Chief Medical Officer</p>
                 </div>
                 <p className="text-[11px] text-gray-500 leading-relaxed">
                   Former head of Clinical Pharmacy with 15+ years in personalized medicine.
                 </p>
               </div>
             </div>

             {/* Card 2 */}
             <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               <div className="h-48 w-full bg-gray-200">
                 <img src="/image/expert_marcus.png" alt="Marcus Thorne" className="w-full h-full object-cover" />
               </div>
               <div className="p-5 space-y-3">
                 <div>
                   <h4 className="font-bold text-[#021024] text-sm">Marcus Thorne</h4>
                   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Head of Operations</p>
                 </div>
                 <p className="text-[11px] text-gray-500 leading-relaxed">
                   Logistics expert dedicated to perfecting the last-mile delivery of care.
                 </p>
               </div>
             </div>

             {/* Card 3 */}
             <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               <div className="h-48 w-full bg-gray-200">
                 <img src="/image/expert_elena.png" alt="Elena Rodriguez" className="w-full h-full object-cover" />
               </div>
               <div className="p-5 space-y-3">
                 <div>
                   <h4 className="font-bold text-[#021024] text-sm">Elena Rodriguez</h4>
                   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Lead Pharmacist</p>
                 </div>
                 <p className="text-[11px] text-gray-500 leading-relaxed">
                   Specialist in geriatric pharmacology and chronic condition management.
                 </p>
               </div>
             </div>

             {/* Card 4 */}
             <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               <div className="h-48 w-full bg-gray-200">
                 <img src="/image/expert_david.png" alt="David Park" className="w-full h-full object-cover" />
               </div>
               <div className="p-5 space-y-3">
                 <div>
                   <h4 className="font-bold text-[#021024] text-sm">David Park</h4>
                   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">CTO</p>
                 </div>
                 <p className="text-[11px] text-gray-500 leading-relaxed">
                   Architecting the secure, AI-driven platforms that power Apomacy.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 pb-24">
        <div className="max-w-6xl mx-auto bg-[#021024] rounded-[2rem] p-12 md:py-16 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Ready for a Better Pharmacy Experience?</h2>
            <p className="text-gray-300 text-sm">
              Join thousands of users who have simplified their health journey with Apomacy.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-white text-[#021024] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto text-sm">
                Get Started Now
              </button>
              <button className="bg-transparent border border-gray-600 text-white px-8 py-3 rounded-xl font-semibold hover:border-white transition-colors w-full sm:w-auto text-sm">
                Contact Us
              </button>
            </div>
          </div>
          {/* Background glow effects */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#052659] rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#5483B3] rounded-full blur-3xl opacity-20"></div>
        </div>
      </section>
      
    </div>
  );
}
