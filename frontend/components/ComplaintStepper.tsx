"use client";

import React from "react";
import { Check, ShieldCheck, Lock, FileText } from "lucide-react";

interface ComplaintStepperProps {
  currentStep: 1 | 2 | 3;
  completedSteps: number[];
  onStepClick: (step: 1 | 2 | 3) => void;
}

export const ComplaintStepper: React.FC<ComplaintStepperProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  const steps = [
    { num: 1, title: "Terms & Conditions", subtitle: "Acceptance & Legal Declaration", icon: ShieldCheck },
    { num: 2, title: "Citizen Verification & Checklist", subtitle: "Mobile OTP & Pre-Requisites", icon: Lock },
    { num: 3, title: "Report Fraud & AI Cash-Out Predictor", subtitle: "Transaction Input & ATM Forecasting", icon: FileText },
  ];

  return (
    <div className="w-full bg-[#f8fafc] border-b border-gray-200 py-4 px-4 sm:px-8 font-sans shadow-inner">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative">
          
          {/* Connector Line */}
          <div className="hidden sm:block absolute top-1/2 left-16 right-16 -translate-y-1/2 h-0.5 bg-gray-200 -z-0">
            <div
              className="h-full bg-[#007ceb] transition-all duration-300"
              style={{
                width: completedSteps.includes(2) ? "100%" : completedSteps.includes(1) ? "50%" : "0%",
              }}
            ></div>
          </div>

          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.num) && currentStep !== step.num;
            const isActive = step.num === currentStep;
            const isUnlocked = step.num === 1 || completedSteps.includes(step.num - 1) || step.num <= currentStep;

            return (
              <div
                key={step.num}
                onClick={() => {
                  if (isUnlocked) {
                    onStepClick(step.num as 1 | 2 | 3);
                  }
                }}
                className={`flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border z-10 transition-all ${
                  isActive
                    ? "border-[#007ceb] ring-2 ring-blue-500/20 shadow-md"
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-50/40 cursor-pointer hover:border-emerald-600"
                    : isUnlocked
                    ? "border-gray-300 cursor-pointer hover:border-blue-400"
                    : "border-gray-200 opacity-50 cursor-not-allowed"
                }`}
                title={!isUnlocked ? `Please complete Step ${step.num - 1} first.` : ""}
              >
                {/* Step Circle Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#007ceb] text-white shadow"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </div>

                {/* Step Labels */}
                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-xs font-bold leading-tight ${
                        isActive ? "text-[#005a9c]" : isCompleted ? "text-emerald-800" : "text-gray-700"
                      }`}
                    >
                      Step {step.num}: {step.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 block">
                    {step.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
