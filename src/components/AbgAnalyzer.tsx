"use client";

import { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HelpCircle, Copy, Download, Beaker, Wind, FlaskConical, ClipboardList, GitCompareArrows, Gauge, Calculator } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import html2canvas from 'html2canvas';
import { PatientDetailsForm } from './PatientDetailsForm';
import AbgReport from './AbgReport';

type AbgValues = {
  ph: string;
  paco2: string;
  hco3: string;
  pao2: string;
  fio2: string;
  na: string;
  cl: string;
};

type Interpretation = {
  acidBaseStatus: string;
  primaryDisorder: string;
  compensation: string;
  summary: string;
  compensationAnalysis: {
    title: string;
    expected: string;
    actual: string;
    interpretation: string;
  } | null;
};

const getStatusColor = (value: number, normalMin: number, normalMax: number) => {
  if (isNaN(value)) return "border-gray-300 dark:border-gray-600";
  if (value < normalMin || value > normalMax) return "border-red-500";
  return "border-green-500";
};

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="flex items-center space-x-2 border-b pb-2 mb-4">
    {icon}
    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{title}</h3>
  </div>
);

export const AbgAnalyzer = () => {
  const [values, setValues] = useState<AbgValues>({
    ph: "", paco2: "", hco3: "", pao2: "", fio2: "0.21", na: "", cl: "",
  });
  const [patientDetails, setPatientDetails] = useState({
    name: "", age: "", mrn: "", hospital: "",
  });
  const [patm, setPatm] = useState(760);
  const [respiratoryDuration, setRespiratoryDuration] = useState<'acute' | 'chronic'>('acute');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatientDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setValues({ ph: "", paco2: "", hco3: "", pao2: "", fio2: "0.21", na: "", cl: "" });
    setPatientDetails({ name: "", age: "", mrn: "", hospital: "" });
    setPatm(760);
    setRespiratoryDuration('acute');
  };

  const handleDownload = () => {
    if (reportRef.current) {
      showSuccess("Generating report...");
      html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `abg-report-${patientDetails.mrn || 'patient'}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const interpretation: Interpretation | null = useMemo(() => {
    const ph = parseFloat(values.ph);
    const paco2 = parseFloat(values.paco2);
    const hco3 = parseFloat(values.hco3);

    if (isNaN(ph) || isNaN(paco2) || isNaN(hco3)) {
      return null;
    }

    let acidBaseStatus = "Normal";
    if (ph < 7.35) acidBaseStatus = "Acidosis";
    if (ph > 7.45) acidBaseStatus = "Alkalosis";

    let primaryDisorder = "Normal";
    if (acidBaseStatus === "Acidosis") {
      if (paco2 > 45) primaryDisorder = "Respiratory";
      else if (hco3 < 22) primaryDisorder = "Metabolic";
      else primaryDisorder = "Mixed";
    } else if (acidBaseStatus === "Alkalosis") {
      if (paco2 < 35) primaryDisorder = "Respiratory";
      else if (hco3 > 26) primaryDisorder = "Metabolic";
      else primaryDisorder = "Mixed";
    } else if (ph >= 7.35 && ph <= 7.45) {
        if (paco2 > 45) primaryDisorder = "Respiratory Acidosis";
        else if (paco2 < 35) primaryDisorder = "Respiratory Alkalosis";
        else if (hco3 < 22) primaryDisorder = "Metabolic Acidosis";
        else if (hco3 > 26) primaryDisorder = "Metabolic Alkalosis";
    }

    let compensationStatus = "Uncompensated";
    let compensationAnalysis: Interpretation['compensationAnalysis'] = null;

    const isCompensating = () => {
        if (primaryDisorder.includes("Metabolic") && acidBaseStatus === "Acidosis") return paco2 < 35;
        if (primaryDisorder.includes("Metabolic") && acidBaseStatus === "Alkalosis") return paco2 > 45;
        if (primaryDisorder.includes("Respiratory") && acidBaseStatus === "Acidosis") return hco3 > 26;
        if (primaryDisorder.includes("Respiratory") && acidBaseStatus === "Alkalosis") return hco3 < 22;
        return false;
    };

    if (primaryDisorder !== "Normal" && primaryDisorder !== "Mixed") {
        if (isCompensating()) {
            if (ph >= 7.35 && ph <= 7.45) {
                compensationStatus = "Fully Compensated";
            } else {
                compensationStatus = "Partially Compensated";
            }
        } else {
            compensationStatus = "Uncompensated";
        }
    }

    if (primaryDisorder === "Metabolic Acidosis" || (primaryDisorder === "Metabolic" && acidBaseStatus === "Acidosis")) {
        const expectedPaco2 = (1.5 * hco3) + 8;
        const expectedPaco2Min = expectedPaco2 - 2;
        const expectedPaco2Max = expectedPaco2 + 2;
        let interpretationText = "";
        if (paco2 >= expectedPaco2Min && paco2 <= expectedPaco2Max) {
            interpretationText = "Compensation is appropriate.";
        } else if (paco2 < expectedPaco2Min) {
            interpretationText = "Suggests a co-existing respiratory alkalosis.";
        } else {
            interpretationText = "Suggests a co-existing respiratory acidosis.";
        }
        compensationAnalysis = {
            title: "Winter's Formula (Metabolic Acidosis)",
            expected: `PaCO₂: ${expectedPaco2Min.toFixed(1)} - ${expectedPaco2Max.toFixed(1)} mmHg`,
            actual: `PaCO₂: ${paco2.toFixed(1)} mmHg`,
            interpretation: interpretationText
        };
    } else if (primaryDisorder === "Metabolic Alkalosis" || (primaryDisorder === "Metabolic" && acidBaseStatus === "Alkalosis")) {
        const expectedPaco2 = 0.7 * hco3 + 21;
        const expectedPaco2Min = expectedPaco2 - 2;
        const expectedPaco2Max = expectedPaco2 + 2;
        let interpretationText = "";
        if (paco2 >= expectedPaco2Min && paco2 <= expectedPaco2Max) {
            interpretationText = "Compensation is appropriate.";
        } else if (paco2 < expectedPaco2Min) {
            interpretationText = "Suggests a co-existing respiratory alkalosis.";
        } else {
            interpretationText = "Suggests a co-existing respiratory acidosis.";
        }
        compensationAnalysis = {
            title: "Metabolic Alkalosis Compensation",
            expected: `PaCO₂: ${expectedPaco2Min.toFixed(1)} - ${expectedPaco2Max.toFixed(1)} mmHg`,
            actual: `PaCO₂: ${paco2.toFixed(1)} mmHg`,
            interpretation: interpretationText
        };
    } else if (primaryDisorder.includes("Respiratory")) {
        let expectedHco3, title, expectedHco3Min, expectedHco3Max;
        if (acidBaseStatus === "Acidosis") {
            if (respiratoryDuration === 'acute') {
                title = "Acute Respiratory Acidosis";
                expectedHco3 = 24 + ((paco2 - 40) / 10);
                expectedHco3Min = expectedHco3;
                expectedHco3Max = expectedHco3 + 2;
            } else {
                title = "Chronic Respiratory Acidosis";
                expectedHco3 = 24 + (3.5 * (paco2 - 40) / 10);
                expectedHco3Min = expectedHco3;
                expectedHco3Max = expectedHco3 + 3;
            }
        } else {
            if (respiratoryDuration === 'acute') {
                title = "Acute Respiratory Alkalosis";
                expectedHco3 = 24 - (2 * (40 - paco2) / 10);
                expectedHco3Min = expectedHco3 - 2;
                expectedHco3Max = expectedHco3;
            } else {
                title = "Chronic Respiratory Alkalosis";
                expectedHco3 = 24 - (5 * (40 - paco2) / 10);
                expectedHco3Min = expectedHco3 - 3;
                expectedHco3Max = expectedHco3;
            }
        }
        let interpretationText = "";
        if (hco3 >= expectedHco3Min && hco3 <= expectedHco3Max) {
            interpretationText = "Compensation is appropriate.";
        } else if (hco3 < expectedHco3Min) {
            interpretationText = "Suggests a co-existing metabolic acidosis.";
        } else {
            interpretationText = "Suggests a co-existing metabolic alkalosis.";
        }
        compensationAnalysis = {
            title: `${title} Compensation`,
            expected: `HCO₃⁻: ${expectedHco3Min.toFixed(1)} - ${expectedHco3Max.toFixed(1)} mEq/L`,
            actual: `HCO₃⁻: ${hco3.toFixed(1)} mEq/L`,
            interpretation: interpretationText
        };
    }

    let summary = "Normal ABG.";
    if (primaryDisorder !== "Normal" && primaryDisorder !== "Mixed") {
        summary = `${compensationStatus} ${primaryDisorder.replace(" Acidosis", "").replace(" Alkalosis", "")} ${acidBaseStatus}.`;
        if (compensationAnalysis && !compensationAnalysis.interpretation.includes("appropriate")) {
            summary += ` ${compensationAnalysis.interpretation}`;
        }
    } else if (primaryDisorder === "Mixed") {
        summary = "Mixed acid-base disorder."
    }

    return { acidBaseStatus, primaryDisorder, compensation: compensationStatus, summary, compensationAnalysis };
  }, [values.ph, values.paco2, values.hco3, respiratoryDuration]);

  const anionGapResult = useMemo(() => {
    const na = parseFloat(values.na);
    const cl = parseFloat(values.cl);
    const hco3 = parseFloat(values.hco3);
    if (isNaN(na) || isNaN(cl) || isNaN(hco3)) return null;
    const anionGap = na - (cl + hco3);
    let status: "Normal" | "Elevated" | "Low" = "Normal";
    let color: "default" | "destructive" | "secondary" = "default";
    let interpretationText = "Normal anion gap.";
    if (anionGap > 12) {
      status = "Elevated";
      color = "destructive";
      interpretationText = "Suggests high anion gap metabolic acidosis (e.g., DKA, lactic acidosis, uremia).";
    } else if (anionGap < 4) {
      status = "Low";
      color = "secondary";
      interpretationText = "May indicate hypoalbuminemia, hypercalcemia, or lab error.";
    }
    return { value: anionGap.toFixed(1), status, color, interpretation: interpretationText };
  }, [values.na, values.cl, values.hco3]);

  const oxygenationResult = useMemo(() => {
    const pao2 = parseFloat(values.pao2);
    const fio2 = parseFloat(values.fio2);
    const paco2 = parseFloat(values.paco2);
    if (isNaN(pao2) || isNaN(fio2)) return null;
    const ratio = pao2 / fio2;
    let level: "Normal" | "Mild" | "Moderate" | "Severe" = "Normal";
    let color: "default" | "yellow" | "orange" | "destructive" = "default";
    if (ratio < 300 && ratio >= 200) { level = "Mild"; color = "yellow"; }
    else if (ratio < 200 && ratio >= 100) { level = "Moderate"; color = "orange"; }
    else if (ratio < 100) { level = "Severe"; color = "destructive"; }
    let aaGradient = null;
    if (!isNaN(paco2)) {
        const PAO2 = (fio2 * (patm - 47)) - (paco2 / 0.8);
        aaGradient = (PAO2 - pao2).toFixed(1);
    }
    return {
        ratio: ratio.toFixed(1),
        level,
        color,
        aaGradient,
        interpretation: `PaO₂/FiO₂ ratio of ${ratio.toFixed(1)} indicates ${level.toLowerCase()} hypoxemia.`
    };
  }, [values.pao2, values.fio2, values.paco2, patm]);

  const handleCopy = () => {
    let fullSummary = "";
    if (interpretation) fullSummary += interpretation.summary;
    if (oxygenationResult) fullSummary += ` ${oxygenationResult.interpretation}`;
    if (anionGapResult) fullSummary += ` Anion Gap: ${anionGapResult.value} (${anionGapResult.status}). ${anionGapResult.interpretation}`;
    if (oxygenationResult?.aaGradient) fullSummary += ` A-a Gradient: ${oxygenationResult.aaGradient} mmHg.`
    navigator.clipboard.writeText(fullSummary.trim());
    showSuccess("Result summary copied to clipboard!");
  };

  const isRespiratoryDisorder = interpretation?.primaryDisorder.includes('Respiratory');
  const showResults = interpretation || oxygenationResult || anionGapResult;

  return (
    <div className="w-full">
      <PatientDetailsForm details={patientDetails} onChange={handlePatientDetailsChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Input Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center text-gray-700 dark:text-gray-200">
                Enter Lab Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <SectionHeader icon={<Beaker className="h-5 w-5 text-blue-500" />} title="Acid-Base" />
                <div>
                  <div className="flex items-center space-x-2 mb-1"><label htmlFor="ph" className="text-sm font-medium text-gray-600 dark:text-gray-300">pH (7.35-7.45)</label><Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Blood acidity</p></TooltipContent></Tooltip></div>
                  <Input type="number" name="ph" id="ph" value={values.ph} onChange={handleInputChange} placeholder="e.g., 7.40" className={`transition-all ${getStatusColor(parseFloat(values.ph), 7.35, 7.45)}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1"><label htmlFor="paco2" className="text-sm font-medium text-gray-600 dark:text-gray-300">PaCO₂ (35-45 mmHg)</label><Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Respiratory component</p></TooltipContent></Tooltip></div>
                  <Input type="number" name="paco2" id="paco2" value={values.paco2} onChange={handleInputChange} placeholder="e.g., 40" className={`transition-all ${getStatusColor(parseFloat(values.paco2), 35, 45)}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1"><label htmlFor="hco3" className="text-sm font-medium text-gray-600 dark:text-gray-300">HCO₃⁻ (22-26 mEq/L)</label><Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Metabolic component</p></TooltipContent></Tooltip></div>
                  <Input type="number" name="hco3" id="hco3" value={values.hco3} onChange={handleInputChange} placeholder="e.g., 24" className={`transition-all ${getStatusColor(parseFloat(values.hco3), 22, 26)}`} />
                </div>
                {isRespiratoryDisorder && (
                    <div className="space-y-2 pt-2 animate-fade-in">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Respiratory Disorder Duration</label>
                        <ToggleGroup type="single" value={respiratoryDuration} onValueChange={(value) => { if (value) setRespiratoryDuration(value as 'acute' | 'chronic'); }} className="w-full grid grid-cols-2">
                            <ToggleGroupItem value="acute">Acute</ToggleGroupItem>
                            <ToggleGroupItem value="chronic">Chronic</ToggleGroupItem>
                        </ToggleGroup>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Select to calculate expected metabolic compensation.</p>
                    </div>
                )}
              </div>
              <div className="space-y-4">
                <SectionHeader icon={<Wind className="h-5 w-5 text-green-500" />} title="Oxygenation" />
                <div>
                  <div className="flex items-center space-x-2 mb-1"><label htmlFor="pao2" className="text-sm font-medium text-gray-600 dark:text-gray-300">PaO₂ (80-100 mmHg)</label><Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Arterial oxygen pressure</p></TooltipContent></Tooltip></div>
                  <Input type="number" name="pao2" id="pao2" value={values.pao2} onChange={handleInputChange} placeholder="e.g., 95" className={`transition-all ${getStatusColor(parseFloat(values.pao2), 80, 100)}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1"><label htmlFor="fio2" className="text-sm font-medium text-gray-600 dark:text-gray-300">FiO₂ (0.21-1.0)</label><Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Fraction of inspired oxygen (0.21 is room air)</p></TooltipContent></Tooltip></div>
                  <Input type="number" name="fio2" id="fio2" value={values.fio2} onChange={handleInputChange} placeholder="e.g., 0.21" step="0.01" />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1"><label htmlFor="patm" className="text-sm font-medium text-gray-600 dark:text-gray-300">Barometric Pressure</label><span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{patm} mmHg</span></div>
                    <Slider id="patm" value={[patm]} onValueChange={(val) => setPatm(val[0])} min={500} max={800} step={5} />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Adjust for altitude (Sea level ~760 mmHg).</p>
                </div>
              </div>
              <div className="space-y-4">
                <SectionHeader icon={<FlaskConical className="h-5 w-5 text-purple-500" />} title="Electrolytes for Anion Gap" />
                <div>
                  <div className="flex items-center space-x-2 mb-1"><label htmlFor="na" className="text-sm font-medium text-gray-600 dark:text-gray-300">Na⁺ (135-145 mEq/L)</label></div>
                  <Input type="number" name="na" id="na" value={values.na} onChange={handleInputChange} placeholder="e.g., 140" className={`transition-all ${getStatusColor(parseFloat(values.na), 135, 145)}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1"><label htmlFor="cl" className="text-sm font-medium text-gray-600 dark:text-gray-300">Cl⁻ (96-106 mEq/L)</label></div>
                  <Input type="number" name="cl" id="cl" value={values.cl} onChange={handleInputChange} placeholder="e.g., 100" className={`transition-all ${getStatusColor(parseFloat(values.cl), 96, 106)}`} />
                </div>
              </div>
              <div className="flex w-full items-center space-x-2 pt-4">
                <Button onClick={handleReset} variant="outline" className="flex-1">Reset</Button>
                <Button onClick={handleCopy} className="flex-1"><Copy className="mr-2 h-4 w-4" />Copy Summary</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3">
          <div className="sticky top-8 space-y-4">
            {showResults ? (
              <>
                {interpretation && (
                  <Card className="animate-fade-in shadow-md">
                    <CardHeader className="flex flex-row items-center space-x-2 bg-blue-50 dark:bg-blue-900/50 rounded-t-lg py-3 px-4">
                      <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">ABG Interpretation</h3>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Disorder:</span> {interpretation.primaryDisorder} {interpretation.acidBaseStatus}</p>
                      <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Compensation:</span> {interpretation.compensation}</p>
                      <div className="pt-2 mt-2 border-t border-blue-200 dark:border-blue-800">
                        <p className="font-bold text-blue-800 dark:text-blue-300">{interpretation.summary}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {interpretation?.compensationAnalysis && (
                    <Card className="animate-fade-in shadow-md">
                      <CardHeader className="flex flex-row items-center space-x-2 bg-purple-50 dark:bg-purple-900/50 rounded-t-lg py-3 px-4">
                        <GitCompareArrows className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{interpretation.compensationAnalysis.title}</h3>
                      </CardHeader>
                      <CardContent className="p-4 space-y-1">
                          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Expected:</span><span className="font-mono">{interpretation.compensationAnalysis.expected}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Actual:</span><span className="font-mono">{interpretation.compensationAnalysis.actual}</span></div>
                          <p className="text-sm pt-2 mt-2 border-t border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300">{interpretation.compensationAnalysis.interpretation}</p>
                      </CardContent>
                    </Card>
                )}
                {oxygenationResult && (
                    <Card className="animate-fade-in shadow-md">
                      <CardHeader className="flex flex-row items-center space-x-2 bg-green-50 dark:bg-green-900/50 rounded-t-lg py-3 px-4">
                        <Gauge className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Oxygenation Status</h3>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between"><p className="text-gray-700 dark:text-gray-300">P/F Ratio:</p><p className="text-2xl font-bold text-green-800 dark:text-green-300">{oxygenationResult.ratio}</p></div>
                          <div className="flex items-center justify-between"><p className="text-gray-700 dark:text-gray-300">Level:</p><Badge variant={oxygenationResult.color as any}>{oxygenationResult.level}</Badge></div>
                          {oxygenationResult.aaGradient && (<div className="flex items-center justify-between"><p className="text-gray-700 dark:text-gray-300">A-a Gradient:</p><p className="font-mono text-green-800 dark:text-green-300">{oxygenationResult.aaGradient} mmHg</p></div>)}
                      </CardContent>
                    </Card>
                )}
                {anionGapResult && (
                  <Card className="animate-fade-in shadow-md">
                    <CardHeader className="flex flex-row items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/50 rounded-t-lg py-3 px-4">
                      <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Anion Gap</h3>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between"><p className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">{anionGapResult.value} <span className="text-sm font-normal">mEq/L</span></p><Badge variant={anionGapResult.color}>{anionGapResult.status}</Badge></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{anionGapResult.interpretation}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[300px]">
                <p className="text-gray-500 dark:text-gray-400">Enter values to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showResults && (
        <div className="mt-8">
          <AbgReport
            ref={reportRef}
            patientDetails={patientDetails}
            abgValues={values}
            interpretation={interpretation}
            oxygenationResult={oxygenationResult}
            anionGapResult={anionGapResult}
          />
          <div className="flex justify-center mt-4">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Report as PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};