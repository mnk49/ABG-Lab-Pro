"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  mmHg: { paco2: "35-45", pao2: "80-100" },
  kPa: { paco2: "4.7-6.0", pao2: "10.7-13.3" }
};

const ReportRow = ({ label, value, unit, range }: { label: string; value: string; unit?: string; range?: string }) => (
  <div className="flex justify-between items-baseline py-2 border-b border-gray-100 dark:border-gray-800">
    <div className="flex items-center">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 w-28">{label}</p>
      <p className="font-mono font-bold text-base text-gray-800 dark:text-gray-200">{value || 'N/A'}</p>
      {unit && <p className="ml-1 text-xs text-gray-500">{unit}</p>}
    </div>
    {range && <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{range}</p>}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-2 pb-1 border-b-2 border-gray-200 dark:border-gray-700">
    {children}
  </h4>
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
    <div ref={ref} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-custom border font-sans">
      <Card className="w-full border-0 shadow-none bg-transparent">
        <CardHeader className="text-center p-4 border-b-4 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-3">
            <Hospital className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">{patientDetails.hospital || 'Clinical Report'}</CardTitle>
          </div>
          <p className="text-md font-semibold text-blue-600 dark:text-blue-400 mt-2 tracking-wider">ARTERIAL BLOOD GAS ANALYSIS</p>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 my-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Patient Information</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="font-medium text-gray-500">Patient Name:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{patientDetails.name || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-500">Age:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{patientDetails.age || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-500">MRN:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{patientDetails.mrn || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-500">Report Date:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date().toLocaleString()}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <div>
              <SectionTitle>Primary Values</SectionTitle>
              <ReportRow label="pH" value={abgValues.ph} range="(7.35-7.45)" />
              <ReportRow label="PaCO₂" value={abgValues.paco2} unit={pressureUnit} range={`(${currentRanges.paco2})`} />
              <ReportRow label="HCO₃⁻" value={abgValues.hco3} unit="mEq/L" range="(22-26)" />
              <ReportRow label="PaO₂" value={abgValues.pao2} unit={pressureUnit} range={`(${currentRanges.pao2})`} />
            </div>
            <div>
              <SectionTitle>Calculations & Electrolytes</SectionTitle>
              <ReportRow label="Anion Gap" value={anionGapResult?.value} unit="mEq/L" />
              <ReportRow label="P/F Ratio" value={oxygenationResult?.ratio} />
              <ReportRow label="A-a Gradient" value={oxygenationResult?.aaGradient} unit="mmHg" />
              <ReportRow label="Na⁺" value={abgValues.na} unit="mEq/L" range="(135-145)" />
              <ReportRow label="Cl⁻" value={abgValues.cl} unit="mEq/L" range="(96-106)" />
            </div>
          </div>

          <SectionTitle>Interpretation Summary</SectionTitle>
          {fullInterpretation.length > 0 ? (
            <div className="mt-4 space-y-3 bg-blue-50 dark:bg-blue-900/30 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
              {fullInterpretation.map((line, index) => (
                <p key={index} className="text-base text-gray-800 dark:text-gray-200 flex items-start">
                  <span className="font-bold text-blue-700 dark:text-blue-400 mr-3 mt-1">&#8227;</span>
                  <span>{line}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2 italic">No interpretation available.</p>
          )}
        </CardContent>

        <CardFooter className="p-4 mt-6 border-t-2 border-gray-200 dark:border-gray-700 text-center">
          <div className="w-full">
            <p className="text-xs text-gray-500 dark:text-gray-500 italic">
              This is an automated analysis and is not a substitute for clinical judgment. All results must be correlated with the patient's clinical condition by a qualified healthcare professional.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Report generated by an application built by Muneeb.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
});

export default AbgReport;