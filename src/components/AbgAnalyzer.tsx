"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { HelpCircle, Copy } from "lucide-react";
import { showSuccess } from "@/utils/toast";

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
};

const getStatusColor = (value: number, normalMin: number, normalMax: number) => {
  if (isNaN(value)) return "border-gray-300 dark:border-gray-600";
  if (value < normalMin || value > normalMax) return "border-red-500";
  return "border-green-500";
};

export const AbgAnalyzer = () => {
  const [values, setValues] = useState<AbgValues>({
    ph: "",
    paco2: "",
    hco3: "",
    pao2: "",
    fio2: "0.21",
    na: "",
    cl: "",
  });
  const [patm, setPatm] = useState(760);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setValues({ ph: "", paco2: "", hco3: "", pao2: "", fio2: "0.21", na: "", cl: "" });
    setPatm(760);
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
    }

    let compensation = "Uncompensated";
    if (primaryDisorder === "Respiratory" && acidBaseStatus === "Acidosis") {
      if (hco3 > 26) compensation = "Partially Compensated";
      if (ph >= 7.35 && ph <= 7.45) compensation = "Fully Compensated";
    } else if (primaryDisorder === "Respiratory" && acidBaseStatus === "Alkalosis") {
      if (hco3 < 22) compensation = "Partially Compensated";
      if (ph >= 7.35 && ph <= 7.45) compensation = "Fully Compensated";
    } else if (primaryDisorder === "Metabolic" && acidBaseStatus === "Acidosis") {
      if (paco2 < 35) compensation = "Partially Compensated";
      if (ph >= 7.35 && ph <= 7.45) compensation = "Fully Compensated";
    } else if (primaryDisorder === "Metabolic" && acidBaseStatus === "Alkalosis") {
      if (paco2 > 45) compensation = "Partially Compensated";
      if (ph >= 7.35 && ph <= 7.45) compensation = "Fully Compensated";
    }
    
    if (ph >= 7.35 && ph <= 7.45 && (paco2 > 45 || paco2 < 35 || hco3 > 26 || hco3 < 22)) {
        compensation = "Fully Compensated";
        if (paco2 > 45) primaryDisorder = "Respiratory Acidosis";
        else if (paco2 < 35) primaryDisorder = "Respiratory Alkalosis";
        else if (hco3 < 22) primaryDisorder = "Metabolic Acidosis";
        else if (hco3 > 26) primaryDisorder = "Metabolic Alkalosis";
    }

    let summary = "Normal ABG.";
    if (primaryDisorder !== "Normal") {
        summary = `${compensation} ${primaryDisorder} ${acidBaseStatus}.`;
    }

    return { acidBaseStatus, primaryDisorder, compensation, summary };
  }, [values.ph, values.paco2, values.hco3]);

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

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-700 dark:text-gray-200">
          ABG & Oxygenation Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs Column */}
          <div className="space-y-4">
            {/* ABG Inputs */}
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b pb-2">Acid-Base</h3>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="ph" className="text-sm font-medium text-gray-600 dark:text-gray-300">pH (7.35-7.45)</label>
                <Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Blood acidity</p></TooltipContent></Tooltip>
              </div>
              <Input type="number" name="ph" id="ph" value={values.ph} onChange={handleInputChange} placeholder="e.g., 7.40" className={`transition-all ${getStatusColor(parseFloat(values.ph), 7.35, 7.45)}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="paco2" className="text-sm font-medium text-gray-600 dark:text-gray-300">PaCO₂ (35-45 mmHg)</label>
                <Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Respiratory component</p></TooltipContent></Tooltip>
              </div>
              <Input type="number" name="paco2" id="paco2" value={values.paco2} onChange={handleInputChange} placeholder="e.g., 40" className={`transition-all ${getStatusColor(parseFloat(values.paco2), 35, 45)}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="hco3" className="text-sm font-medium text-gray-600 dark:text-gray-300">HCO₃⁻ (22-26 mEq/L)</label>
                <Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Metabolic component</p></TooltipContent></Tooltip>
              </div>
              <Input type="number" name="hco3" id="hco3" value={values.hco3} onChange={handleInputChange} placeholder="e.g., 24" className={`transition-all ${getStatusColor(parseFloat(values.hco3), 22, 26)}`} />
            </div>
            
            {/* Oxygenation Inputs */}
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b pb-2 pt-4">Oxygenation</h3>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="pao2" className="text-sm font-medium text-gray-600 dark:text-gray-300">PaO₂ (80-100 mmHg)</label>
                <Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Arterial oxygen pressure</p></TooltipContent></Tooltip>
              </div>
              <Input type="number" name="pao2" id="pao2" value={values.pao2} onChange={handleInputChange} placeholder="e.g., 95" className={`transition-all ${getStatusColor(parseFloat(values.pao2), 80, 100)}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="fio2" className="text-sm font-medium text-gray-600 dark:text-gray-300">FiO₂ (0.21-1.0)</label>
                <Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger><TooltipContent><p>Fraction of inspired oxygen (0.21 is room air)</p></TooltipContent></Tooltip>
              </div>
              <Input type="number" name="fio2" id="fio2" value={values.fio2} onChange={handleInputChange} placeholder="e.g., 0.21" step="0.01" />
            </div>
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label htmlFor="patm" className="text-sm font-medium text-gray-600 dark:text-gray-300">Barometric Pressure</label>
                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{patm} mmHg</span>
                </div>
                <Slider id="patm" value={[patm]} onValueChange={(val) => setPatm(val[0])} min={500} max={800} step={5} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Adjust for altitude (Sea level ~760 mmHg).</p>
            </div>

            {/* Electrolyte Inputs */}
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b pb-2 pt-4">Electrolytes for Anion Gap</h3>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="na" className="text-sm font-medium text-gray-600 dark:text-gray-300">Na⁺ (135-145 mEq/L)</label>
              </div>
              <Input type="number" name="na" id="na" value={values.na} onChange={handleInputChange} placeholder="e.g., 140" className={`transition-all ${getStatusColor(parseFloat(values.na), 135, 145)}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="cl" className="text-sm font-medium text-gray-600 dark:text-gray-300">Cl⁻ (96-106 mEq/L)</label>
              </div>
              <Input type="number" name="cl" id="cl" value={values.cl} onChange={handleInputChange} placeholder="e.g., 100" className={`transition-all ${getStatusColor(parseFloat(values.cl), 96, 106)}`} />
            </div>
          </div>

          {/* Results Column */}
          <div className="flex flex-col space-y-4">
            {interpretation && (
              <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg space-y-3 animate-fade-in">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">ABG Interpretation</h3>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Acid-Base:</span> {interpretation.acidBaseStatus}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Disorder:</span> {interpretation.primaryDisorder}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Compensation:</span> {interpretation.compensation}</p>
                <div className="pt-2 mt-2 border-t border-blue-200 dark:border-blue-800">
                  <p className="font-bold text-blue-800 dark:text-blue-300">{interpretation.summary}</p>
                </div>
              </div>
            )}
            {oxygenationResult && (
                <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg space-y-3 animate-fade-in">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Oxygenation Status</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700 dark:text-gray-300">P/F Ratio:</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-300">{oxygenationResult.ratio}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700 dark:text-gray-300">Level:</p>
                        <Badge variant={oxygenationResult.color as any}>{oxygenationResult.level}</Badge>
                    </div>
                    {oxygenationResult.aaGradient && (
                        <div className="flex items-center justify-between">
                            <p className="text-gray-700 dark:text-gray-300">A-a Gradient:</p>
                            <p className="font-mono text-green-800 dark:text-green-300">{oxygenationResult.aaGradient} mmHg</p>
                        </div>
                    )}
                </div>
            )}
            {anionGapResult && (
              <div className="bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-lg space-y-3 animate-fade-in">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Anion Gap</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">{anionGapResult.value} <span className="text-sm font-normal">mEq/L</span></p>
                  <Badge variant={anionGapResult.color}>{anionGapResult.status}</Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{anionGapResult.interpretation}</p>
              </div>
            )}
            <div className="flex-grow"></div>
            <div className="flex w-full items-center space-x-2 pt-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Reset
              </Button>
              <Button onClick={handleCopy} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy Summary
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};