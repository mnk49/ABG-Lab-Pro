import { AbgAnalyzer } from "@/components/AbgAnalyzer";
import { ReferenceChart } from "@/components/ReferenceChart";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-8 py-8">
        <AbgAnalyzer />
        <ReferenceChart />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;