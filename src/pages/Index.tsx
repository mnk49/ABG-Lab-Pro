import { AbgAnalyzer } from "@/components/AbgAnalyzer";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <AbgAnalyzer />
      <MadeWithDyad />
    </div>
  );
};

export default Index;