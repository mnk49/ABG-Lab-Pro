"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from 'lucide-react';
import { analyzeAbgReport } from '@/lib/gemini';
import { showError, showSuccess } from '@/utils/toast';

interface ScanReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: (values: any) => void;
}

export const ScanReportDialog = ({ open, onOpenChange, onScanComplete }: ScanReportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const extractedValues = await analyzeAbgReport(file);
      // Convert all values to string for the form fields
      const stringValues = Object.entries(extractedValues).reduce((acc, [key, value]) => {
        acc[key as keyof typeof acc] = String(value);
        return acc;
      }, {} as any);

      onScanComplete(stringValues);
      showSuccess("Report analyzed successfully!");
      onOpenChange(false); // Close dialog on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      showError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog is closed
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFile(null);
      setError(null);
      setIsLoading(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan ABG Report</DialogTitle>
          <DialogDescription>
            Upload an image, text, or PDF file of the report. The AI will attempt to extract the values.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="report-file">Upload File</Label>
            <Input id="report-file" type="file" onChange={handleFileChange} accept="image/*,.txt,.pdf" />
          </div>
          {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAnalyze} disabled={!file || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Analyze Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};