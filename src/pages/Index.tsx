import { AbgAnalyzer } from "@/components/AbgAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <header className="relative w-full text-center pt-12 pb-8">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100">
          ABG Lab Pro
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Clinical ABG insights made easy
        </p>
      </header>
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 pb-12">
        <AbgAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;