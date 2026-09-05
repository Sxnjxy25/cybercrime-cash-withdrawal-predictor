"use client";

import React from "react";
import { CheckCircle2, PhoneCall, ArrowRight, ShieldCheck, Lock } from "lucide-react";

interface ComplaintAcceptanceViewProps {
  onAccept: () => void;
}

export const ComplaintAcceptanceView: React.FC<ComplaintAcceptanceViewProps> = ({ onAccept }) => {
  return (
    <div className="w-full min-h-[70vh] bg-[#f0f4f9] py-8 px-4 sm:px-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-3xl w-full">
        
        {/* Urgent Helpline Banner */}
        <div className="mb-5 bg-gradient-to-r from-red-600 to-rose-700 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PhoneCall className="w-5 h-5 text-yellow-300 animate-bounce" />
            <div>
              <span className="font-extrabold text-xs sm:text-sm">VICTIM OF ONGOING FINANCIAL ONLINE FRAUD?</span>
              <span className="text-xs text-red-100 block">Dial Cyber Crime Helpline <strong>1930</strong> immediately for Golden Hour account freezing.</span>
            </div>
          </div>
          <span className="bg-white text-red-700 font-black px-3 py-1 rounded text-xs shadow-sm">
            1930
          </span>
        </div>

        {/* Primary Blue Card matching Reference */}
        <div className="w-full bg-[#1b91e0] text-white rounded-2xl shadow-xl p-8 sm:p-12 relative overflow-hidden border border-blue-400/30">
          
          <div className="relative z-10 space-y-6">
            {/* Header Title */}
            <div className="text-center pb-3 border-b border-blue-300/30">
              <span className="text-xs font-mono font-bold text-yellow-300 uppercase tracking-widest block mb-1">
                STEP 1 OF 3
              </span>
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide drop-shadow-sm">
                Filing a Complaint on National Cyber Crime Reporting Portal
              </h2>
            </div>

            {/* Terms Content */}
            <p className="text-xs sm:text-sm text-blue-50 leading-relaxed text-justify">
              Prior to filing a financial cyber fraud complaint with this portal, please read the following terms and conditions. For common transaction dispute queries prior to filing your complaint, view{" "}
              <a
                href="#faq"
                onClick={(e) => e.preventDefault()}
                className="text-yellow-300 font-bold underline hover:text-yellow-200"
              >
                Frequently Asked Questions FAQ
              </a>.
            </p>

            {/* Declarations */}
            <div className="space-y-3.5 text-xs sm:text-sm text-blue-50">
              <div className="flex items-start space-x-2.5">
                <span className="text-yellow-300 font-bold text-base leading-none">•</span>
                <p className="leading-relaxed">
                  The information I've provided on this form is correct to the best of my knowledge. I acknowledge that providing false information could make me liable to penal actions under Indian Laws.
                </p>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="text-yellow-300 font-bold text-base leading-none">•</span>
                <p className="leading-relaxed">
                  I understand that action on the complaints reported on this portal shall be taken by concerned authorities and banking nodal officers as per Indian Laws.
                </p>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="text-yellow-300 font-bold text-base leading-none">•</span>
                <p className="leading-relaxed">
                  The complaint information you submit to this site is encrypted via Secure Socket Layer (SSL) encryption and hashed with a digital forensic timestamp.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-blue-100 font-medium text-center pt-2">
              We thank you for your cooperation in keeping digital banking transactions safe.
            </p>

            {/* Centered Action Button to Proceed to Step 2 */}
            <div className="flex justify-center pt-2">
              <button
                onClick={onAccept}
                className="bg-[#0a3866] hover:bg-[#06294d] text-white text-xs sm:text-sm font-bold py-3.5 px-8 rounded-lg shadow-xl border border-blue-300/40 transition-all flex items-center space-x-2 cursor-pointer uppercase tracking-wider"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>I Accept & Proceed to Step 2</span>
                <ArrowRight className="w-4 h-4 text-cyan-300 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
