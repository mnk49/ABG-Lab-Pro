"use client";

import React from 'react';
import { Hospital } from 'lucide-react';

interface PatientDetails {
  name: string; age: string; mrn: string; hospital: string;
}

interface AbgValues {
  ph: string; paco2: string; hco3: string; pao2: string;
  fio2: string; na: string; cl: string;
}

interface AbgReportProps {
  patientDetails: PatientDetails;
  abgValues: AbgValues;
  interpretation: any;
  oxygenationResult: any;
  anionGapResult: any;
  pressureUnit: 'mmHg' | 'kPa';
}

const normalRanges = {
  mmHg: { paco2: { min: 35, max: 45 }, pao2: { min: 80, max: 100 } },
  kPa: { paco2: { min: 4.7, max: 6.0 }, pao2: { min: 10.7, max: 13.3 } }
};

const ReportRow = ({ label, value, unit, range }: { label: string; value: string; unit?: string; range?: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    <div className="flex items-baseline gap-x-2">
      <p className="font-semibold text-base text-gray-800 dark:text-gray-200">{value || 'N/A'}</p>
      {unit && <p className="text-xs text-gray-500">{unit}</p>}
      {range && <p className="font-mono text-xs text-gray-500 dark:text-gray-400">({range})</p>}
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-8 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
    {children}
  </h3>
);

const AbgReport = React.forwardRef<HTMLDivElement, AbgReportProps>(({
  patientDetails, abgValues, interpretation, oxygenationResult, anionGapResult, pressureUnit
}, ref) => {

  const fullInterpretation = [
    interpretation?.summary,
    interpretation?.compensationAnalysis?.interpretation,
    oxygenationResult?.interpretation,
    anionGapResult?.interpretation,
  ].filter(Boolean);

  const currentRanges = normalRanges[pressureUnit];

  return (
    <div ref={ref} className="bg-white dark:bg-gray-900 p-6 sm:p-8 font-sans text-gray-800 dark:text-gray-100 shadow-2xl rounded-lg border">
      <header className="text-center mb-8 pb-4 border-b">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Hospital className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-bold">{patientDetails.hospital || 'Clinical Report'}</h1>
        </div>
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">Arterial Blood Gas Analysis</h2>
      </header>
      
      <section className="mb-8">
        <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">Patient Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div><span className="block text-xs text-gray-500">Patient Name</span> <span className="font-semibold">{patientDetails.name || 'N/A'}</span></div>
          <div><span className="block text-xs text-gray-500">Age</span> <span className="font-semibold">{patientDetails.age || 'N/A'}</span></div>
          <div><span className="block text-xs text-gray-500">MRN</span> <span className="font-semibold">{patientDetails.mrn || 'N/A'}</span></div>
          <div><span className="block text-xs text-gray-500">Report Date</span> <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-x-8">
        <div className="md:col-span-3">
          <SectionTitle>Analysis Results</SectionTitle>
          <div>
            <ReportRow label="pH" value={abgValues.ph} range="7.35-7.45" />
            <ReportRow label="PaCO₂" value={abgValues.paco2} unit={pressureUnit} range={`${currentRanges.paco2.min}-${currentRanges.paco2.max}`} />
            <ReportRow label="HCO₃⁻" value={abgValues.hco3} unit="mEq/L" range="22-26" />
            <ReportRow label="PaO₂" value={abgValues.pao2} unit={pressureUnit} range={`${currentRanges.pao2.min}-${currentRanges.pao2.max}`} />
          </div>
          
          <SectionTitle>Calculations & Electrolytes</SectionTitle>
          <div>
            <ReportRow label="Anion Gap" value={anionGapResult?.value} unit="mEq/L" range="4-12" />
            <ReportRow label="P/F Ratio" value={oxygenationResult?.ratio} />
            <ReportRow label="A-a Gradient" value={oxygenationResult?.aaGradient} unit="mmHg" />
            <ReportRow label="Na⁺" value={abgValues.na} unit="mEq/L" range="135-145" />
            <ReportRow label="Cl⁻" value={abgValues.cl} unit="mEq/L" range="96-106" />
          </div>
        </div>

        <div className="md:col-span-2 md:border-l md:pl-8">
          <SectionTitle>Interpretation Summary</SectionTitle>
          {fullInterpretation.length > 0 ? (
            <div className="mt-4 space-y-3 text-sm">
              {fullInterpretation.map((line, index) => (
                <p key={index} className="flex items-start">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mr-2 mt-1">&#8227;</span>
                  <span>{line}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2 italic">No interpretation available.</p>
          )}
        </div>
      </div>

      <footer className="mt-10 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic max-w-2xl mx-auto">
          This is an automated analysis and is not a substitute for clinical judgment. All results must be correlated with the patient's clinical condition by a qualified healthcare professional.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Report generated by <a href="https://abgpro.vercel.app" target="_blank" rel="noopener noreferrer" className="underline">abgpro.vercel.app</a>
        </p>
      </footer>
    </div>
  );
});

export default AbgReport;