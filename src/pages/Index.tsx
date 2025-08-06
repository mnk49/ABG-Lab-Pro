import { useState } from "react";
import { AbgAnalyzer } from "@/components/AbgAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { ScanReportDialog } from "@/components/ScanReportDialog";

const Index = () => {
  const [values, setValues] = useState({
    ph: "", paco2: "", hco3: "", pao2: "", fio2: "0.21", na: "", cl: "",
  });
  const [patientDetails, setPatientDetails] = useState({
    name: "", age: "", mrn: "", hospital: "",
  });
  const [isScanDialogOpen, setScanDialogOpen] = useState(false);

  const handleScanComplete = (scannedData: any) => {
    // Update patient details and lab values from scanned data
    const newPatientDetails = { ...patientDetails };
    const newValues = { ...values };

    Object.keys(patientDetails).forEach(key => {
      if (scannedData[key]) {
        newPatientDetails[key as keyof typeof patientDetails] = scannedData[key];
      }
    });

    Object.keys(values).forEach(key => {
      if (scannedData[key]) {
        newValues[key as keyof typeof values] = scannedData[key];
      }
    });

    setPatientDetails(newPatientDetails);
    setValues(newValues);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <header className="relative w-full text-center pt-12 pb-16 bg-gradient-to-b from-white to-transparent dark:from-gray-900/50 dark:to-transparent">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setScanDialogOpen(true)}>
            <Scan className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Scan Report</span>
          </Button>
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