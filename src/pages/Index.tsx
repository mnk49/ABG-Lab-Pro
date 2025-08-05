import { AbgAnalyzer } from "@/components/AbgAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <div className="absolute top-6 right-6 flex items-center space-x-2">
        <AccessibilityMenu />
        <ThemeToggle />
      </div>
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-12">
        <AbgAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;