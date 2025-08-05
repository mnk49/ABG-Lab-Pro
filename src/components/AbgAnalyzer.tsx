"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Copy } from "lucide-react";
import { showSuccess } from "@/utils/toast";

type AbgValues = {
  ph: string;
  paco2: string;
  hco3: string;
  pao2: string;
  sao2: string;
};

type Interpretation = {
  acidBaseStatus: string;
  primaryDisorder: string;
  compensation: string;
  oxygenation: string;
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
    sao2: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setValues({ ph: "", paco2: "", hco3: "", pao2: "", sao2: "" });
  };

  const interpretation: Interpretation | null = useMemo(() => {
    const ph = parseFloat(values.ph);
    const paco2 = parseFloat(values.paco2);
    const hco3 = parseFloat(values.hco3);
    const pao2 = parseFloat(values.pao2);
    const sao2 = parseFloat(values.sao2);

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


    let oxygenation = "Normal";
    if (!isNaN(pao2)) {
        if (pao2 < 80) oxygenation = "Hypoxemia";
    }
    if (!isNaN(sao2)) {
        if (sao2 < 95) oxygenation = "Hypoxemia";
    }

    let summary = "Normal ABG.";
    if (primaryDisorder !== "Normal") {
        summary = `${compensation} ${primaryDisorder} ${acidBaseStatus}.`;
    }
    if (oxygenation === "Hypoxemia") {
        summary += " Hypoxemia is present.";
    }


    return { acidBaseStatus, primaryDisorder, compensation, oxygenation, summary };
  }, [values]);

  const handleCopy = () => {
    if (interpretation?.summary) {
      navigator.clipboard.writeText(interpretation.summary);
      showSuccess("Result summary copied to clipboard!");
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-700 dark:text-gray-200">
          ABG Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="ph" className="text-sm font-medium text-gray-600 dark:text-gray-300">pH (7.35-7.45)</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Measures the acidity or alkalinity of the blood.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" name="ph" id="ph" value={values.ph} onChange={handleInputChange} placeholder="e.g., 7.40" className={`transition-all ${getStatusColor(parseFloat(values.ph), 7.35, 7.45)}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="paco2" className="text-sm font-medium text-gray-600 dark:text-gray-300">PaCO₂ (35-45 mmHg)</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Partial pressure of carbon dioxide; indicates respiratory function.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" name="paco2" id="paco2" value={values.paco2} onChange={handleInputChange} placeholder="e.g., 40" className={`transition-all ${getStatusColor(parseFloat(values.paco2), 35, 45)}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="hco3" className="text-sm font-medium text-gray-600 dark:text-gray-300">HCO₃⁻ (22-26 mEq/L)</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bicarbonate level; indicates metabolic function.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" name="hco3" id="hco3" value={values.hco3} onChange={handleInputChange} placeholder="e.g., 24" className={`transition-all ${getStatusColor(parseFloat(values.hco3), 22, 26)}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="pao2" className="text-sm font-medium text-gray-600 dark:text-gray-300">PaO₂ (80-100 mmHg)</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Partial pressure of oxygen; measures oxygen levels in the blood.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" name="pao2" id="pao2" value={values.pao2} onChange={handleInputChange} placeholder="e.g., 95" className={`transition-all ${getStatusColor(parseFloat(values.pao2), 80, 100)}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="sao2" className="text-sm font-medium text-gray-600 dark:text-gray-300">SaO₂ (95-100%)</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Oxygen saturation; percentage of hemoglobin carrying oxygen.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" name="sao2" id="sao2" value={values.sao2} onChange={handleInputChange} placeholder="e.g., 98" className={`transition-all ${getStatusColor(parseFloat(values.sao2), 95, 100)}`} />
            </div>
          </div>
          <div className="flex flex-col justify-between">
            {interpretation && (
              <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg space-y-3 animate-fade-in">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Interpretation</h3>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Acid-Base:</span> {interpretation.acidBaseStatus}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Disorder:</span> {interpretation.primaryDisorder}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Compensation:</span> {interpretation.compensation}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Oxygenation:</span> {interpretation.oxygenation}</p>
                <div className="pt-2 mt-2 border-t border-blue-200 dark:border-blue-800">
                  <p className="font-bold text-blue-800 dark:text-blue-300">{interpretation.summary}</p>
                </div>
              </div>
            )}
            <div className="flex w-full items-center space-x-2 mt-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Reset
              </Button>
              {interpretation && (
                <Button onClick={handleCopy} className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Summary
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};