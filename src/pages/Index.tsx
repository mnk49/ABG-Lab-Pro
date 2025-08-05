import { AbgAnalyzer } from "@/components/AbgAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8">
        <AbgAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;