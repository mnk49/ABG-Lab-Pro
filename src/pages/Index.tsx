import { AbgAnalyzer } from "@/components/AbgAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col items-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-6xl mx-auto space-y-8 py-8">
        <AbgAnalyzer />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;