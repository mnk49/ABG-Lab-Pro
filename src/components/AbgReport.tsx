"use client";

import React from 'react';

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

const getFlag = (valueStr: string, min: number, max: number): 'H' | 'L' | '' => {
  const value = parseFloat(valueStr);
  if (isNaN(value)) return '';
  if (value > max) return 'H';
  if (value < min) return 'L';
  return '';
};

const ReportRow = ({ label, value, flag, range }: { label: string; value: string; flag: string; range?: string }) => (
  <div className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
    <p className="col-span-5 text-gray-700 dark:text-gray-300">{label}</p>
    <div className="col-span-3 flex items-center font-semibold text-center">
      <p className={`w-full ${flag ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>{value || 'N/A'}</p>
      {flag && <span className="ml-1 text-red-500 dark:text-red-400 font-bold text-xs">({flag})</span>}
    </div>
    <p className="col-span-4 text-gray-600 dark:text-gray-400 text-right font-mono">{range}</p>
  </div>
);

const TableSectionHeader = ({ title }: { title: string }) => (
  <div className="pt-4 pb-1">
    <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400">{title}</h4>
  </div>
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

  const phFlag = getFlag(abgValues.ph, 7.35, 7.45);
  const paco2Flag = getFlag(abgValues.paco2, currentRanges.paco2.min, currentRanges.paco2.max);
  const hco3Flag = getFlag(abgValues.hco3, 22, 26);
  const pao2Flag = getFlag(abgValues.pao2, currentRanges.pao2.min, currentRanges.pao2.max);
  const naFlag = getFlag(abgValues.na, 135, 145);
  const clFlag = getFlag(abgValues.cl, 96, 106);
  const anionGapFlag = getFlag(anionGapResult?.value, 4, 12);

  return (
    <div ref={ref} className="bg-white dark:bg-gray-900 p-6 sm:p-8 font-sans text-gray-800 dark:text-gray-100 shadow-2xl rounded-lg border">
      <header className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-wider">ARTERIAL BLOOD GAS ANALYSIS</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{patientDetails.hospital || 'Clinical Laboratory'}</p>
      </header>
      
      <section className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm mb-4 border-y border-gray-200 dark:border-gray-700 py-3">
        <div><span className="font-semibold text-gray-600 dark:text-gray-400">Patient:</span> {patientDetails.name || 'N/A'}</div>
        <div><span className="font-semibold text-gray-600 dark:text-gray-400">MRN:</span> {patientDetails.mrn || 'N/A'}</div>
        <div><span className="font-semibold text-gray-600 dark:text-gray-400">Age:</span> {patientDetails.age || 'N/A'}</div>
        <div><span className="font-semibold text-gray-600 dark:text-gray-400">Date:</span> {new Date().toLocaleString()}</div>
      </section>

      <div>
        <div className="grid grid-cols-12 gap-2 py-2 font-bold border-b-2 border-gray-300 dark:border-gray-600 text-sm">
          <p className="col-span-5">Test</p>
          <p className="col-span-3 text-center">Result</p>
          <p className="col-span-4 text-right">Reference Range</p>
        </div>
        
        <TableSectionHeader title="ACID-BASE STATUS" />
        <ReportRow label="pH" value={abgValues.ph} flag={phFlag} range="7.35 - 7.45" />
        <ReportRow label={`PaCO₂ (${pressureUnit})`} value={abgValues.paco2} flag={paco2Flag} range={`${currentRanges.paco2.min} - ${currentRanges.paco2.max}`} />
        <ReportRow label="HCO₃⁻ (mEq/L)" value={abgValues.hco3} flag={hco3Flag} range="22 - 26" />

        <TableSectionHeader title="OXYGENATION STATUS" />
        <ReportRow label={`PaO₂ (${pressureUnit})`} value={abgValues.pao2} flag={pao2Flag} range={`${currentRanges.pao2.min} - ${currentRanges.pao2.max}`} />
        <ReportRow label="P/F Ratio" value={oxygenationResult?.ratio} flag={''} range="> 300" />
        <ReportRow label="A-a Gradient (mmHg)" value={oxygenationResult?.aaGradient} flag={''} range="< 15" />

        <TableSectionHeader title="ELECTROLYTES & CALCULATIONS" />
        <ReportRow label="Anion Gap (mEq/L)" value={anionGapResult?.value} flag={anionGapFlag} range="4 - 12" />
        <ReportRow label="Na⁺ (mEq/L)" value={abgValues.na} flag={naFlag} range="135 - 145" />
        <ReportRow label="Cl⁻ (mEq/L)" value={abgValues.cl} flag={clFlag} range="96 - 106" />
      </div>

      {fullInterpretation.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-sm mb-2 border-t pt-4">INTERPRETATION</h3>
          <div className="text-sm p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border">
            <ul className="space-y-2">
              {fullInterpretation.map((line, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mr-2 mt-1">&#8227;</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic max-w-2xl mx-auto">
          This is an automated analysis and is not a substitute for clinical judgment. All results must be correlated with the patient's clinical condition by a qualified healthcare professional.
        </p>
      </footer>
    </div>
  );
});

export default AbgReport;