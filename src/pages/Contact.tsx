import React, { useRef } from "react";
import { Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

const PricingContactPage: React.FC = () => {
  const { t } = useTranslation();
  const contactRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    });
    console.log(`Copied ${type}: ${text}`);
  };

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-700 flex flex-col">
      <Header />

      {/* Pricing Section */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-8">{t("pricing-plans")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {["Basic", "Standard", "Premium"].map((plan, idx) => (
            <div key={plan} className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-2xl font-semibold mb-2">{plan}</h3>
              <p className="mb-4 text-lg">Includes awesome features</p>
              <button
                onClick={scrollToContact}
                className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full transition"
              >
                {t("purchase-plan")}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="bg-gray-100 py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-10">{t("contact-us")}</h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Phone */}
          <a
            href="tel:+886900170038"
            className="flex items-center gap-4 bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            onClick={() => copyToClipboard("+886900170038", "Phone number")}
          >
            <Phone className="text-blue-600 h-8 w-8" />
            <div>
              <h3 className="font-bold text-xl">{t("phone")}</h3>
              <p>+886 900 170 038</p>
            </div>
          </a>

          {/* LINE */}
          <a
            href="https://line.me/ti/p/R2zf7rn9Mt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <MessageCircle className="text-green-600 h-8 w-8" />
            <div>
              <h3 className="font-bold text-xl">LINE</h3>
              <p>{t("click-to-connect")}</p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/+886900170038?text="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <span className="text-green-500 font-bold text-2xl">W</span>
            <div>
              <h3 className="font-bold text-xl">WhatsApp</h3>
              <p>{t("click-to-connect")}</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:ayman@pokeayman.com"
            className="flex items-center gap-4 bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            onClick={() => copyToClipboard("ayman@pokeayman.com", "Email")}
          >
            <Mail className="text-blue-500 h-8 w-8" />
            <div>
              <h3 className="font-bold text-xl">{t("email")}</h3>
              <p>ayman@pokeayman.com</p>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/shakso/"
            target="_blank"
            rel="noopener noreferrer"
            className="md:col-span-2 flex items-center gap-4 bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <Instagram className="text-pink-500 h-8 w-8" />
            <div>
              <h3 className="font-bold text-xl">Instagram</h3>
              <p>@shakso</p>
            </div>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingContactPage;
