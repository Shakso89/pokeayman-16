import React, { useRef } from "react";
import { Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

const Contact: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-white/60 via-white/40 to-white/10 text-slate-700">
      <Header />

      {/* Pricing Plans */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">💳 Credit Purchase Plans (NTD)</h2>
        <p className="mb-12 text-lg">Choose the perfect plan for your classroom needs</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Basic */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Basic</h3>
            <p className="text-3xl font-bold mb-1">NT$99</p>
            <p className="mb-4">500 Credits</p>
            <ul className="mb-6 text-sm space-y-1">
              <li>• Small groups or test use</li>
              <li>• Instant credit delivery</li>
              <li>• No expiration date</li>
              <li>• 24/7 support included</li>
            </ul>
            <button
              onClick={scrollToContact}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full"
            >
              Purchase Plan
            </button>
          </div>

          {/* Standard - Most Popular */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border-2 border-yellow-400">
            <div className="mb-2 text-sm font-semibold text-yellow-600 uppercase">Most Popular</div>
            <h3 className="text-xl font-semibold mb-2">Standard</h3>
            <p className="text-3xl font-bold mb-1">NT$159</p>
            <p className="mb-4">1000 Credits</p>
            <ul className="mb-6 text-sm space-y-1">
              <li>• Regular classroom activity</li>
              <li>• Instant credit delivery</li>
              <li>• No expiration date</li>
              <li>• 24/7 support included</li>
            </ul>
            <button
              onClick={scrollToContact}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full"
            >
              Purchase Plan
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="text-3xl font-bold mb-1">NT$199</p>
            <p className="mb-4">1750 Credits</p>
            <ul className="mb-6 text-sm space-y-1">
              <li>• Large classes or full access</li>
              <li>• Instant credit delivery</li>
              <li>• No expiration date</li>
              <li>• 24/7 support included</li>
            </ul>
            <button
              onClick={scrollToContact}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full"
            >
              Purchase Plan
            </button>
          </div>
        </div>

        {/* Credit Explanation */}
        <div className="mt-16 max-w-4xl mx-auto text-left bg-white/50 backdrop-blur-lg p-6 rounded-2xl shadow">
          <h4 className="text-2xl font-bold mb-4">How Credits Work</h4>
          <ul className="space-y-2 text-sm md:text-base">
            <li>• 1 Credit = 1 coin reward for students</li>
            <li>• Posting H.W = 5 coins</li>
            <li>• Approving H.W = credits equal to the coin reward given to the student (e.g., 3 coins = 3 credits)</li>
            <li>• Deleting Pokémon from student = 3 credits</li>
            <li>• Credits never expire once purchased</li>
            <li>• Bulk discounts available for schools</li>
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-20 px-4 bg-white/50 backdrop-blur-lg">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{t("contact-us")}</h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Phone */}
          <a
            href="tel:+886900170038"
            className="flex items-center gap-4 bg-white/80 p-6 rounded-xl shadow hover:shadow-lg transition"
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
            className="flex items-center gap-4 bg-white/80 p-6 rounded-xl shadow hover:shadow-lg transition"
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
            className="flex items-center gap-4 bg-white/80 p-6 rounded-xl shadow hover:shadow-lg transition"
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
            className="flex items-center gap-4 bg-white/80 p-6 rounded-xl shadow hover:shadow-lg transition"
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
            className="md:col-span-2 flex items-center gap-4 bg-white/80 p-6 rounded-xl shadow hover:shadow-lg transition"
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

export default Contact;
