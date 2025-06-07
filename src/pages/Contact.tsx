import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

const PricingAndContact: React.FC = () => {
  const contactRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    });
    console.log(`Contact attempt via ${type}: ${text}`);
  };

  const logContact = (method: string, value?: string) => {
    console.log(`Contact attempt via ${method}${value ? `: ${value}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center text-slate-700">
      <Header />

      {/* Pricing Section */}
      <section className="w-full max-w-6xl px-6 py-12 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-center">{t("pricing-plans") || "Pricing Plans"}</h1>
        <div className="grid gap-8 md:grid-cols-3 w-full">
          {[
            { title: "Basic", price: "$10", features: ["Feature A", "Feature B"] },
            { title: "Pro", price: "$20", features: ["Feature A", "Feature B", "Feature C"] },
            { title: "Premium", price: "$30", features: ["Everything included", "Priority Support"] }
          ].map((plan, i) => (
            <div
              key={i}
              className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center text-center hover:shadow-xl transition"
            >
              <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
              <p className="text-lg font-semibold mb-4">{plan.price}</p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
              <button
                onClick={scrollToContact}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-700 font-bold py-2 px-6 rounded-full transition"
              >
                {t("purchase-plan") || "Purchase Plan"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="w-full max-w-4xl px-6 py-12">
        <div className="bg-white/50 backdrop-blur-md rounded-xl p-8 shadow-xl w-full">
          <h1 className="text-4xl font-bold mb-8 text-center">{t("contact-us") || "Contact Us"}</h1>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Phone */}
            <a
              href="tel:+886900170038"
              className="flex items-center gap-4 bg-white hover:bg-gray-100 p-6 rounded-2xl transition"
              onClick={() => {
                copyToClipboard("+886900170038", "Phone number");
                logContact("Phone", "+886900170038");
              }}
            >
              <div className="bg-blue-200 rounded-full p-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl">{t("phone") || "Phone"}</h3>
                <p>+886 900 170 038</p>
              </div>
            </a>

            {/* LINE */}
            <a
              href="https://line.me/ti/p/R2zf7rn9Mt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white hover:bg-gray-100 p-6 rounded-2xl transition"
              onClick={() => logContact("LINE")}
            >
              <div className="bg-green-200 rounded-full p-4">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl">LINE</h3>
                <p>{t("click-to-connect") || "Click to connect"}</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/+886900170038?text="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white hover:bg-gray-100 p-6 rounded-2xl transition"
              onClick={() => logContact("WhatsApp", "+886900170038")}
            >
              <div className="bg-green-100 rounded-full p-4">
                <span className="text-green-700 font-bold text-xl">W</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">WhatsApp</h3>
                <p>{t("click-to-connect") || "Click to connect"}</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:ayman@pokeayman.com"
              className="flex items-center gap-4 bg-white hover:bg-gray-100 p-6 rounded-2xl transition"
              onClick={() => {
                copyToClipboard("ayman@pokeayman.com", "Email");
                logContact("Email", "ayman@pokeayman.com");
              }}
            >
              <div className="bg-blue-100 rounded-full p-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl">{t("email") || "Email"}</h3>
                <p>ayman@pokeayman.com</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/shakso/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white hover:bg-gray-100 p-6 rounded-2xl transition md:col-span-2"
              onClick={() => logContact("Instagram", "@shakso")}
            >
              <div className="bg-pink-100 rounded-full p-4">
                <Instagram className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Instagram</h3>
                <p>@shakso</p>
              </div>
            </a>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-10 px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold mx-auto block text-lg"
          >
            {t("back-to-home") || "Back to Home"}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingAndContact;
