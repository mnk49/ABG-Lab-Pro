"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PatientDetails {
  name: string;
  age: string;
  mrn: string;
  hospital: string;
}

interface AbgValues {
  ph: string;
  paco2: string;
  hco3: string;
  pao2: string;
  fio2: string;
  na: string;
  cl: string;
}

interface AbgReportProps {
  patientDetails: PatientDetails;
  abgValues: AbgValues;
  interpretation: any;
  oxygenationResult: any;
  anionGapResult: any;
}

const ReportRow = ({ label, value, unit, range }: { label: string; value: string; unit?: string; range?: string }) => (
  <div className="flex justify-between items-baseline py-2">
    <div className="flex items-center">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24">{label}</p>
      <p className="font-mono font-bold text-base text-gray-800 dark:text-gray-200">
        {value || 'N/A'}
      </p>
      {unit && <p className="ml-1 text-xs text-gray-500">{unit}</p>}
    </div>
    {range && <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{range}</p>}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
    {children}
  </h4>
);

const AbgReport = React.forwardRef<HTMLDivElement, AbgReportProps>(({
  patientDetails,
  abgValues,
  interpretation,
  oxygenationResult,
  anionGapResult
}, ref) => {

  const fullInterpretation = [
    interpretation?.summary,
    interpretation?.compensationAnalysis?.interpretation,
    oxygenationResult?.interpretation,
    anionGapResult?.interpretation,
  ].filter(Boolean);

  return (
    <div ref={ref} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-custom border">
      <Card className="w-full border-0 shadow-none bg-transparent">
        <CardHeader className="text-center p-4">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">ARTERIAL BLOOD GAS ANALYSIS</p>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {patientDetails.hospital || 'Clinical Report'}
          </CardTitle>
        </CardHeader>
        
        <Separator />

        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm mb-6">
            <div className="font-medium text-gray-500">Patient: <span className="font-bold text-gray-800 dark:text-gray-200">{patientDetails.name || 'N/A'}</span></div>
            <div className="font-medium text-gray-500">Age: <span className="font-bold text-gray-800 dark:text-gray-200">{patientDetails.age || 'N/A'}</span></div>
            <div className="font-medium text-gray-500">MRN: <span className="font-bold text-gray-800 dark:text-gray-200">{patientDetails.mrn || 'N/A'}</span></div>
            <div className="font-medium text-gray-500">Date: <span className="font-bold text-gray-800 dark:text-gray-200">{new Date().toLocaleDateString()}</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div>
              <SectionTitle>Primary Values</SectionTitle>
              <ReportRow label="pH" value={abgValues.ph} range="(7.35-7.45)" />
              <ReportRow label="PaCO₂" value={abgValues.paco2} unit="mmHg" range="(35-45)" />
              <ReportRow label="HCO₃⁻" value={abgValues.hco3} unit="mEq/L" range="(22-26)" />
              <ReportRow label="PaO₂" value={abgValues.pao2} unit="mmHg" range="(80-100)" />
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

          <SectionTitle>Interpretation</SectionTitle>
          {fullInterpretation.length > 0 ? (
            <div className="mt-2 space-y-2 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              {fullInterpretation.map((line, index) => (
                <p key={index} className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-semibold text-blue-700 dark:text-blue-400 mr-2">&bull;</span>{line}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No interpretation available.</p>
          )}

        </CardContent>

        <CardFooter className="p-4 mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 w-full">
            This is an automated analysis. All results should be clinically correlated by a qualified healthcare professional.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
});

export default AbgReport;