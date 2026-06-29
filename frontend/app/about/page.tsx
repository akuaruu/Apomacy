import React from 'react';
import { ArrowRight, Eye, Thermometer, Heart, Package, CheckCircle2, Shield, PieChart, Users } from 'lucide-react';

const VISION_VALUES = [
  {
    icon: <Eye size={24} className="text-[#052659]" />,
    title: "Aksesibilitas Utama",
    description: "Kami percaya perawatan kesehatan berkualitas tidak boleh menjadi kemewahan yang dibatasi oleh lokasi. Dengan mendigitalisasi pengalaman apotek, kami menghadirkan perawatan esensial bagi masyarakat pedesaan maupun perkotaan tanpa hambatan.",
    bgClass: "bg-[#e6f2fb] text-[#021024] md:col-span-2 flex flex-col justify-between overflow-hidden relative group p-8 md:p-10 rounded-[2rem]",
    extraElement: (
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
    )
  },
  {
    icon: <Thermometer size={24} className="text-[#7DA0CA]" />,
    title: "Presisi Klinis",
    description: "Setiap resep obat diverifikasi melalui protokol pemeriksaan ganda yang ketat, memadukan akurasi bantuan AI dengan pengawasan apoteker ahli untuk memastikan keamanan mutlak.",
    bgClass: "bg-[#021024] text-white flex flex-col justify-between p-8 md:p-10 rounded-[2rem] space-y-8",
    extraElement: (
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <h4 className="font-bold text-white text-sm">99.9% Akurasi</h4>
        <p className="text-[10px] text-gray-400 mt-1">dalam pengiriman resep obat</p>
      </div>
    )
  },
  {
    icon: <Heart size={24} className="text-[#021024]" />,
    title: "Dukungan Penuh Empati",
    description: "Lebih dari sekadar logistik, kami menghadirkan sentuhan kemanusiaan. Apoteker berlisensi kami siap melayani konsultasi virtual, menawarkan kehangatan dan keahlian saat Anda paling membutuhkannya.",
    bgClass: "bg-[#a7c5ea] text-[#021024] flex flex-col space-y-4 p-8 md:p-10 rounded-[2rem]"
  },
  {
    icon: null,
    title: "Inventaris Lebih Cerdas",
    description: "Pelacakan langsung secara real-time dan penyediaan stok prediktif memastikan kami memiliki apa yang Anda butuhkan, bahkan sebelum Anda menyadari persediaan Anda mulai menipis.",
    bgClass: "bg-[#f4f8fb] text-[#021024] md:col-span-2 flex items-center justify-between group p-8 md:p-10 rounded-[2rem]",
    extraElement: (
      <div className="hidden md:flex items-center justify-center p-6 text-gray-300 group-hover:text-[#a7c5ea] transition-colors shrink-0">
        <Package size={64} strokeWidth={1.5} />
      </div>
    )
  }
];

const WHY_CHOOSE_ITEMS = [
  {
    icon: <CheckCircle2 size={20} />,
    title: "Pengiriman Langsung ke Rumah",
    description: "Pengiriman pada hari yang sama untuk obat-obatan darurat dan pengiriman terjadwal untuk perawatan penyakit kronis."
  },
  {
    icon: <Shield size={20} />,
    title: "Brankas Data yang Aman",
    description: "Catatan kesehatan Anda dilindungi dengan enkripsi setara perbankan dan kepatuhan standar HIPAA yang ketat."
  },
  {
    icon: <PieChart size={20} />,
    title: "Transparansi Harga",
    description: "Tanpa biaya tersembunyi. Kami bekerja sama dengan berbagai penyedia asuransi utama untuk memastikan Anda mendapatkan tarif terbaik."
  }
];

const EXPERTS = [
  {
    name: "Dr. Sarah Chen",
    role: "Chief Medical Officer",
    image: "/image/expert_sarah.png",
    description: "Mantan kepala Farmasi Klinis dengan pengalaman lebih dari 15 tahun di bidang pengobatan personal."
  },
  {
    name: "Marcus Thorne",
    role: "Head of Operations",
    image: "/image/expert_marcus.png",
    description: "Pakar logistik yang berdedikasi tinggi untuk menyempurnakan pengantaran layanan ke pintu rumah Anda."
  },
  {
    name: "Elena Rodriguez",
    role: "Lead Pharmacist",
    image: "/image/expert_elena.png",
    description: "Spesialis dalam farmakologi geriatri dan manajemen kondisi kesehatan kronis."
  },
  {
    name: "David Park",
    role: "CTO",
    image: "/image/expert_david.png",
    description: "Merancang platform berbasis AI yang aman dan canggih untuk memberdayakan Apomacy."
  }
];

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">

      {/* Hero Section */}
      <section
        id="perjalanan-kami"
        className="bg-linear-to-br from-[#f8faff] to-[#e6f2fb] px-10 py-16 md:py-20 scroll-mt-28"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-[#e6f2fb] text-[#052659] font-semibold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider">
              PERJALANAN KAMI
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#021024] leading-tight">
              Mendefinisikan Ulang Perawatan di Era Digital
            </h1>

            <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
              Di Apomacy, kami percaya bahwa perawatan kesehatan harus selaras
              dan semudah detak jantung. Kami menjembatani kesenjangan antara
              keunggulan klinis dan kenyamanan digital.
            </p>

            <div className="pt-2">
              <button
                type="button"
                className="bg-[#021024] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-[#052659] transition-colors shadow-lg"
              >
                Jelajahi Misi Kami
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full flex justify-center md:justify-end">
            <div className="w-full max-w-md h-[450px] rounded-3xl overflow-hidden relative shadow-lg">
              <img
                src="/image/hero_pharmacist.png"
                alt="Apoteker"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-8 -ml-16 md:left-4 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 max-w-[200px]">
              <h4 className="text-2xl font-bold text-[#021024]">
                10k+
              </h4>

              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Resep diantarkan dengan tingkat presisi dan kepedulian tinggi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Core Values */}
      <section
        id="visi-nilai"
        className="px-10 py-20 bg-[#fafafa] scroll-mt-28"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[#021024]">
              Visi & Nilai Inti Kami
            </h2>

            <p className="text-gray-500 text-sm">
              Dipandu oleh komitmen terhadap integritas, inovasi, dan empati,
              kami membangun masa depan yang lebih sehat untuk semua orang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VISION_VALUES.map((item, idx) => (
              <div key={idx} className={item.bgClass}>
                <div className="space-y-4 max-w-md relative z-10">
                  {item.icon}

                  <h3 className="text-2xl font-bold">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed opacity-90">
                    {item.description}
                  </p>
                </div>

                {item.extraElement}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Apomacy? */}
      <section
        id="mengapa-apomacy"
        className="px-10 py-24 bg-linear-to-br from-[#f8faff] to-[#e6f2fb] scroll-mt-28"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-10">
            <h2 className="text-3xl font-bold text-[#021024]">
              Mengapa Memilih Apomacy?
            </h2>

            <div className="space-y-8">
              {WHY_CHOOSE_ITEMS.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#e6f2fb] text-[#052659] flex items-center justify-center shrink-0 shadow-xs">
                    {item.icon}
                  </div>

                  <div>
                    <h4 className="font-bold text-[#021024] mb-1 text-sm">
                      {item.title}
                    </h4>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="w-full h-[350px] rounded-3xl overflow-hidden shadow-2xl relative">
              <img
                src="/image/smart_locker.png"
                alt="Teknologi Keamanan"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Experts */}
      <section
        id="tim-kami"
        className="px-10 py-24 scroll-mt-28"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[#021024]">
              Perkenalkan Pakar Kami
            </h2>

            <p className="text-gray-500 text-sm">
              Para ahli hebat yang bekerja tanpa lelah untuk mentransformasikan
              pengalaman perawatan kesehatan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {EXPERTS.map((expert, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 w-full bg-gray-200">
                  <img
                    src={expert.image}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="font-bold text-[#021024] text-sm">
                      {expert.name}
                    </h4>

                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                      {expert.role}
                    </p>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {expert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 pb-24">
        <div className="max-w-6xl mx-auto bg-[#021024] rounded-[2rem] p-12 md:py-16 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Siap untuk Pengalaman Apotek yang Lebih Better?</h2>
            <p className="text-gray-300 text-sm">
              Bergabunglah bersama ribuan pengguna yang telah mempermudah perjalanan kesehatan mereka bersama Apomacy.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button type="button" className="bg-white text-[#021024] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto text-sm">
                Mulai Sekarang
              </button>
              <button type="button" className="bg-transparent border border-gray-600 text-white px-8 py-3 rounded-xl font-semibold hover:border-white transition-colors w-full sm:w-auto text-sm">
                Hubungi Kami
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
