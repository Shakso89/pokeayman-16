import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
          Our Pricing Plans
        </h1>

        <div className="grid gap-8 md:grid-cols-3 w-full">
          {/* Basic Plan */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-lg text-white hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold mb-4">Basic</h2>
            <p className="text-4xl font-bold mb-6">$0</p>
            <ul className="space-y-2 mb-6">
              <li>✓ Access to basic features</li>
              <li>✓ Community support</li>
              <li>✓ Limited customization</li>
            </ul>
            <button className="w-full py-2 px-4 bg-white/30 rounded-lg font-semibold hover:bg-white/40 transition-colors">
              Choose Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-lg text-white hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold mb-4">Pro</h2>
            <p className="text-4xl font-bold mb-6">$10/mo</p>
            <ul className="space-y-2 mb-6">
              <li>✓ All basic features</li>
              <li>✓ Priority support</li>
              <li>✓ Custom themes</li>
            </ul>
            <button className="w-full py-2 px-4 bg-white/30 rounded-lg font-semibold hover:bg-white/40 transition-colors">
              Choose Plan
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-lg text-white hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold mb-4">Enterprise</h2>
            <p className="text-4xl font-bold mb-6">$99/mo</p>
            <ul className="space-y-2 mb-6">
              <li>✓ Everything in Pro</li>
              <li>✓ Dedicated account manager</li>
              <li>✓ Custom integrations</li>
            </ul>
            <button className="w-full py-2 px-4 bg-white/30 rounded-lg font-semibold hover:bg-white/40 transition-colors">
              Choose Plan
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PricingPage;
