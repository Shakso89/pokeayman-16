import React, { useRef } from "react";
import { Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

const PricingContactPage: React.FC = () => {
  const { t } = useTranslation();
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
    console.log(`Contact attempt via ${method}${value ? `: ${value}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center">
      <Header />

      {/* Pricing Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl w-full max-w-3xl mb-20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">{t("pricing")}</h1>

          <div className="grid gap-6 md:grid-cols-3">
            {["basic-plan", "pro-plan", "enterprise-plan"].map((plan) => (
              <div key={plan} className="bg-white/20 rounded-xl p-6 text-white text-center">
                <h2 className="text-2xl font-bold mb-4">{t(plan)}</h2>
                <p className="mb-6">
                  {plan === "basic-plan"
                    ? "Free"
                    : plan === "pro-plan"
                    ? "$29.99 / month"
                    : "Custom pricing"}
                </p>
                <button
                  onClick={scrollToContact}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition"
                >
                  {t("purchase-plan")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div ref={contactRef} className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl w-full max-w-3xl mb-20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">{t("contact-us")}</h1>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Phone */}
            <a
              href="tel:+886900170038"
              className="flex items-center gap-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm p-6 rounded-2xl transition-all transform hover:scale-105"
              onClick={() => {
                copyToClipboard("+886900170038", "Phone number");
                logContact("Phone", "+886900170038");
              }}
            >
              <div className="bg-blue-600 rounded-full p-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">{t("phone")}</h3>
                <p className="text-white/90 text-lg">+886 900 170 038</p>
              </div>
            </a>

            {/* LINE */}
            <a
              href="https://line.me/ti/p/R2zf7rn9Mt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm p-6 rounded-2xl transition-all transform hover:scale-105"
              onClick={() => logContact("LINE")}
            >
              <div className="bg-green-600 rounded-full p-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">LINE</h3>
                <p className="text-white/90 text-lg">{t("click-to-connect")}</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/+886900170038?text="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm p-6 rounded-2xl transition-all transform hover:scale-105"
              onClick={() => logContact("WhatsApp", "+886900170038")}
            >
              <div className="bg-green-500 rounded-full p-4 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">W</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">WhatsApp</h3>
                <p className="text-white/90 text-lg">{t("click-to-connect")}</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:ayman@pokeayman.com"
              className="flex items-center gap-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm p-6 rounded-2xl transition-all transform hover:scale-105"
              onClick={() => {
                copyToClipboard("ayman@pokeayman.com", "Email");
                logContact("Email", "ayman@pokeayman.com");
              }}
            >
              <div className="bg-blue-500 rounded-full p-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">{t("email")}</h3>
                <p className="text-white/90 text-lg">ayman@pokeayman.com</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/shakso/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm p-6 rounded-2xl transition-all transform hover:scale-105 md:col-span-2"
              onClick={() => logContact("Instagram", "@shakso")}
            >
              <div className="bg-pink-600 rounded-full p-4 flex items-center justify-center">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">Instagram</h3>
                <p className="text-white/90 text-lg">@shakso</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PricingContactPage;
