"use client";

import React from "react";
import {
  Twitter, Facebook, Youtube, Instagram, Send, Linkedin, MessageCircle, Share2
} from "lucide-react";

export const NcrpFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#1e2329] text-gray-300 text-xs mt-auto font-sans">
      {/* Top Links & Social Icons Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap justify-between items-center border-b border-gray-700/60 gap-3">
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-gray-300">
          <a href="#feedback" className="hover:text-white transition-colors">Feedback</a>
          <span>|</span>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <span>|</span>
          <a href="#contact" className="hover:text-white transition-colors">Contact Us</a>
          <span>|</span>
          <a href="#policies" className="hover:text-white transition-colors">Website Policies</a>
          <span>|</span>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <span>|</span>
          <a href="#disclaimer" className="hover:text-white transition-colors">Disclaimer</a>
        </div>

        {/* Social Icons matching the screenshot */}
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white hover:opacity-80 cursor-pointer text-[11px] font-bold">𝕏</div>
          <div className="w-6 h-6 rounded bg-[#1877f2] flex items-center justify-center text-white hover:opacity-80 cursor-pointer"><Facebook className="w-3.5 h-3.5" /></div>
          <div className="w-6 h-6 rounded bg-[#ff0000] flex items-center justify-center text-white hover:opacity-80 cursor-pointer"><Youtube className="w-3.5 h-3.5" /></div>
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white hover:opacity-80 cursor-pointer"><Instagram className="w-3.5 h-3.5" /></div>
          <div className="w-6 h-6 rounded bg-[#0088cc] flex items-center justify-center text-white hover:opacity-80 cursor-pointer"><Send className="w-3.5 h-3.5" /></div>
          <div className="w-6 h-6 rounded bg-[#0a66c2] flex items-center justify-center text-white hover:opacity-80 cursor-pointer"><Linkedin className="w-3.5 h-3.5" /></div>
          <div className="w-6 h-6 rounded bg-[#25d366] flex items-center justify-center text-white hover:opacity-80 cursor-pointer"><MessageCircle className="w-3.5 h-3.5" /></div>
        </div>
      </div>

      {/* Bottom Managed By Strip */}
      <div className="w-full bg-[#12161b] py-2.5 px-4 text-center text-[11px] text-gray-400">
        Website Content Managed by Ministry of Home Affairs, Govt. of India. Best viewed in Mozilla Firefox, Google Chrome.
      </div>
    </footer>
  );
};
