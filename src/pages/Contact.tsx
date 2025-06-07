import React, { useRef } from "react";
import { Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

const PricingAndContact: React.FC = () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white/40 via-white/20 to-transparent text-slate-700">
      <Header />

      {/* Pricing Section */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">💳 Credit Purchase Plans (NTD)</h2>
        <p className="text-lg mb-12">Choose the perfect plan for your classroom needs</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Basic",
              price: "NT$99",
              credits: "500 Credits",
              description: "Small groups or test use",
            },
            {
              title: "Standard",
              price: "NT$159",
              credits: "1000 Credits",
              description: "Regular classroom activity",
              highlight: true,
            },
            {
              title: "Pro",
              price: "NT$199",
              credits: "1750 Credits",
              description: "Large classes or full access",
            },
          ].map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 shadow hover:shadow-xl transition bg-white/30 ${
                plan.highlight ? "border-4 border-yellow-400" : ""
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
              <p className="text-xl font-semibold">{plan.price}</p>
              <p className="mb-2">{plan.credits}</p>
              <p className="mb-6">{plan.description}</p>
              <button
                onClick={scrollToContact}
                className="bg-yellow-400 text-slate-700 font-semibold py-2 px-4 rounded hover:bg-yellow-300 transition"
              >
                Purchase Plan
              </button>
              <ul className="text-sm mt-6 space-y-1 text-left">
                <li>✓ Instant credit delivery</li>
                <li>✓ No expiration date</li>
                <li>✓ 24/7 support included</li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-4xl mx-auto text-left bg-white/40 p-6 rounded-2xl shadow">
          <h4 className="text-2xl font-bold mb-4">How Credits Work</h4>
          <ul className="list-disc list-inside space-y-2">
            <li>1 Credit = 1 coin reward for students</li>
            <li>Posting H.W = 5 coins</li>
            <li>Approving H.W = credits equal to reward given (e.g. 3 coins = 3 credits)</li>
            <li>Deleting Pokémon from student = 3 credits</li>
            <li>Credits never expire once purchased</li>
            <li>Bulk discounts available for schools</li>
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">📞 Contact Us</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Methods */}
          {[
            {
              label: "Phone",
              value: "+886900170038",
              icon: <Phone className="h-6 w-6 text-white" />,
              bg: "bg-blue-600",
              href: "tel:+886900170038",
            },
            {
              label: "LINE",
              value: "Click to connect",
              icon: <MessageCircle className="h-6 w-6 text-white" />,
              bg: "bg-green-600",
              href: "https://line.me/ti/p/R2zf7rn9Mt",
            },
            {
              label: "WhatsApp",
              value: "Click to connect",
              icon: <span className="text-white font-bold text-xl">W</span>,
              bg: "bg-green-500",
              href: "https://wa.me/+886900170038?text=",
            },
            {
              label: "Email",
              value: "ayman@pokeayman.com",
              icon: <Mail className="h-6 w-6 text-white" />,
              bg: "bg-blue-500",
              href: "mailto:ayman@pokeayman.com",
            },
            {
              label: "Instagram",
              value: "@shakso",
              icon: <Instagram className="h-6 w-6 text-white" />,
              bg: "bg-pink-600",
              href: "https://www.instagram.com/shakso/",
              full: true,
            },
          ].map((contact, index) => (
            <a
              key={index}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (contact.label === "Email" || contact.label === "Phone")
                  copyToClipboard(contact.value, contact.label);
              }}
              className={`flex items-center gap-4 bg-white/30 p-6 rounded-xl shadow hover:shadow-lg transition ${
                contact.full ? "md:col-span-2" : ""
              }`}
            >
              <div className={`${contact.bg} rounded-full p-4`}>{contact.icon}</div>
              <div className="text-left">
                <h4 className="font-bold text-lg">{contact.label}</h4>
                <p className="text-sm">{contact.value}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingAndContact;
