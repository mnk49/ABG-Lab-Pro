"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  ].filter(Boolean).join('\n  - ');

  const reportText = `
HOSPITAL: ${patientDetails.hospital || 'N/A'}
--------------------------------------------------
PATIENT NAME: ${patientDetails.name || 'N/A'}
AGE:          ${patientDetails.age || 'N/A'}
MRN:          ${patientDetails.mrn || 'N/A'}
--------------------------------------------------
ARTERIAL BLOOD GAS REPORT
--------------------------------------------------
VALUES:
  pH:      ${abgValues.ph || 'N/A'}      (7.35-7.45)
  PaCO₂:   ${abgValues.paco2 || 'N/A'} mmHg   (35-45)
  HCO₃⁻:   ${abgValues.hco3 || 'N/A'} mEq/L  (22-26)
  PaO₂:    ${abgValues.pao2 || 'N/A'} mmHg   (80-100)

ELECTROLYTES:
  Na⁺:     ${abgValues.na || 'N/A'} mEq/L  (135-145)
  Cl⁻:     ${abgValues.cl || 'N/A'} mEq/L  (96-106)

CALCULATIONS:
  Anion Gap: ${anionGapResult?.value || 'N/A'} mEq/L
  P/F Ratio: ${oxygenationResult?.ratio || 'N/A'}
  A-a Grad:  ${oxygenationResult?.aaGradient || 'N/A'} mmHg

--------------------------------------------------
INTERPRETATION:
  - ${fullInterpretation || 'No interpretation available.'}
--------------------------------------------------
`;

  return (
    <div ref={ref} className="bg-white dark:bg-gray-900 p-2 rounded-lg">
      <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            ABG Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
            {reportText.trim()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
});

export default AbgReport;