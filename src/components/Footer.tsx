export const Footer = () => {
  return (
    <footer className="w-full py-8 px-4 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="text-sm text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800/60">
          <p>
            ⚠️ This tool is for educational and informational purposes only. Always consult a licensed healthcare professional before making clinical decisions.
          </p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            💬 For queries or feedback, contact the developer{" "}
            <a
              href="https://github.com/mnk49"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              here
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};