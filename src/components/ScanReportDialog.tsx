"use client";

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Camera, X, Check, KeyRound } from 'lucide-react';
import { analyzeAbgReport } from '@/lib/gemini';
import { showError, showSuccess } from '@/utils/toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScanReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: (values: any) => void;
}

// Helper function to convert data URL to File
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error("Invalid data URL");
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export const ScanReportDialog = ({ open, onOpenChange, onScanComplete }: ScanReportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ReactNode | null>(null);
  const [view, setView] = useState<'upload' | 'camera' | 'preview'>('upload');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

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
      const analysisPromise = analyzeAbgReport(file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI analysis timed out after 30 seconds.")), 30000)
      );

      const extractedValues = await Promise.race([
        analysisPromise,
        timeoutPromise,
      ]);

      const stringValues = Object.entries(extractedValues as object).reduce((acc, [key, value]) => {
        acc[key as keyof typeof acc] = String(value);
        return acc;
      }, {} as any);

      onScanComplete(stringValues);
      showSuccess("Report analyzed successfully!");
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      if (errorMessage.includes("API key is not configured")) {
        const specificError = (
          <div className="text-center text-destructive bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800/50">
            <KeyRound className="mx-auto h-8 w-8 mb-2" />
            <p className="font-semibold">Configuration Needed</p>
            <p className="text-sm mt-1">
              The AI feature requires a Google Gemini API key. Please add it as an environment variable named <code className="font-mono bg-red-100 dark:bg-red-900/50 px-1 py-0.5 rounded">VITE_GEMINI_API_KEY</code> in your project settings.
            </p>
          </div>
        );
        setError(specificError);
        showError("Gemini API key is missing.");
      } else {
        showError(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleOpenCamera = async () => {
    stopStream();
    setError(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setView('camera');
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    if (view === 'camera' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [view, stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        setView('preview');
        stopStream();
      }
    }
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      const imageFile = dataURLtoFile(capturedImage, `capture-${Date.now()}.png`);
      setFile(imageFile);
      setView('upload');
      setCapturedImage(null);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      stopStream();
      setFile(null);
      setError(null);
      setIsLoading(false);
      setView('upload');
      setCapturedImage(null);
    }
    onOpenChange(isOpen);
  };

  const content = (
    <div className="space-y-4">
      {view === 'upload' && (
        <div className="flex flex-col space-y-4 pt-4">
          <Button variant="outline" className="w-full py-8 text-lg" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-4 h-6 w-6" />
            Upload File
          </Button>
          <Input ref={fileInputRef} id="report-file" type="file" onChange={handleFileChange} accept="image/*,.txt,.pdf" className="hidden" />
          
          <Button variant="outline" className="w-full py-8 text-lg" onClick={handleOpenCamera}>
            <Camera className="mr-4 h-6 w-6" />
            Open Camera
          </Button>
        </div>
      )}

      {view === 'camera' && (
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-md bg-black"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button size="icon" className="rounded-full h-16 w-16" onClick={handleCapture}>
              <Camera className="h-8 w-8" />
            </Button>
          </div>
        </div>
      )}

      {view === 'preview' && capturedImage && (
        <div className="space-y-4">
          <img src={capturedImage} alt="Captured report" className="w-full rounded-md" />
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleOpenCamera}><X className="mr-2 h-4 w-4" /> Retake</Button>
            <Button onClick={handleUsePhoto}><Check className="mr-2 h-4 w-4" /> Use Photo</Button>
          </div>
        </div>
      )}

      {error && <div>{error}</div>}
    </div>
  );

  const footer = (
    <>
      {view === 'camera' ? (
        <Button variant="outline" onClick={() => setView('upload')} className="w-full">Cancel</Button>
      ) : (
        <div className="flex w-full gap-2 sm:gap-0 sm:space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">Cancel</Button>
          <Button onClick={handleAnalyze} disabled={!file || isLoading} className="w-full">
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>) : (<>Analyze with AI</>)}
          </Button>
        </div>
      )}
    </>
  );

  const DialogTitleComponent = isMobile ? DrawerTitle : DialogTitle;
  const DialogDescriptionComponent = isMobile ? DrawerDescription : DialogDescription;

  const dialogHeaderContent = (
    <>
      <DialogTitleComponent>Scan Report with AI</DialogTitleComponent>
      <DialogDescriptionComponent>
        {view === 'upload' && "Choose a method to scan your report."}
        {view === 'camera' && "Position the report in the frame and capture."}
        {view === 'preview' && "Review the captured image."}
      </DialogDescriptionComponent>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            {dialogHeaderContent}
          </DrawerHeader>
          <div className="px-4">{content}</div>
          <DrawerFooter className="pt-2">{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          {dialogHeaderContent}
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};