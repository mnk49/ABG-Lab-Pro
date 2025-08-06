import { useState } from "react";
import { AbgAnalyzer } from "@/components/AbgAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { ScanReportDialog } from "@/components/ScanReportDialog";
import { AbgValues, PatientDetails, PressureUnit } from "@/types";

const Index = () => {
  const [isScanDialogOpen, setScanDialogOpen] = useState(false);

  // All state for the analyzer is lifted here to be shared with other components
  const [values, setValues] = useState<AbgValues>({
    ph: "", paco2: "", hco3: "", pao2: "", fio2: "0.21", na: "", cl: "",
  });
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: "", age: "", mrn: "", hospital: "",
  });
  const [patm, setPatm] = useState(760);
  const [respiratoryDuration, setRespiratoryDuration] = useState<'acute' | 'chronic'>('acute');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('mmHg');

  const handleReset = () => {
    setValues({ ph: "", paco2: "", hco3: "", pao2: "", fio2: "0.21", na: "", cl: "" });
    setPatientDetails({ name: "", age: "", mrn: "", hospital: "" });
    setPatm(760);
    setRespiratoryDuration('acute');
    setPressureUnit('mmHg');
  };

  const handleScanComplete = (scannedData: any) => {
    const newAbgValues: Partial<AbgValues> = {};
    const newPatientDetails: Partial<PatientDetails> = {};

    const abgKeys: (keyof AbgValues)[] = ['ph', 'paco2', 'hco3', 'pao2', 'fio2', 'na', 'cl'];
    const patientKeys: (keyof PatientDetails)[] = ['name', 'age', 'mrn', 'hospital'];

    for (const key in scannedData) {
      if (abgKeys.includes(key as keyof AbgValues)) {
        newAbgValues[key as keyof AbgValues] = String(scannedData[key] ?? '');
      }
      if (patientKeys.includes(key as keyof PatientDetails)) {
        newPatientDetails[key as keyof PatientDetails] = String(scannedData[key] ?? '');
      }
    }

    setValues(prev => ({ ...prev, ...newAbgValues }));
    setPatientDetails(prev => ({ ...prev, ...newPatientDetails }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <header className="relative w-full text-center pt-12 pb-16 bg-gradient-to-b from-white to-transparent dark:from-gray-900/50 dark:to-transparent">
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setScanDialogOpen(true)}
              className="hover:bg-transparent dark:hover:bg-transparent transition-transform duration-200 ease-in-out hover:scale-110"
            >
              <Scan className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Scan Report</span>
            </Button>
            <div className="absolute -top-2 -right-4 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md pointer-events-none animate-float whitespace-nowrap">
              AI Powered
            </div>
          </div>
          <ThemeToggle />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100">
          ABG Lab Pro
        </h1>
        <div className="mt-4 flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-lg text-gray-600 dark:text-gray-400">
          <p>⚡clinical ABG insights made easy!</p>
          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <a href="https://github.com/mnk49" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <span>👨‍💻</span>
            <span>Developed by Muneeb Nazeem</span>
          </a>
        </div>
      </header>
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 pb-12">
        <AbgAnalyzer
          values={values}
          setValues={setValues}
          patientDetails={patientDetails}
          setPatientDetails={setPatientDetails}
          patm={patm}
          setPatm={setPatm}
          respiratoryDuration={respiratoryDuration}
          setRespiratoryDuration={setRespiratoryDuration}
          pressureUnit={pressureUnit}
          setPressureUnit={setPressureUnit}
          onReset={handleReset}
        />
      </main>
      <Footer />
      <ScanReportDialog 
        open={isScanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
};

export default Index;