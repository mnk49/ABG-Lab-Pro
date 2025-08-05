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
        <AbgAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;