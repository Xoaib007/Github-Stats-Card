import React, { useState } from "react";
import GitHubStatsCard from "./components/GitHubStatsCard";


const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false); // Type the dark mode state

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark"); // Switch to dark mode
    } else {
      document.documentElement.classList.remove("dark"); // Switch to light mode
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="flex flex-col items-center">
        <button
          onClick={toggleDarkMode}
          className="mb-4 py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          Toggle Dark Mode
        </button>
        <GitHubStatsCard username="Xoaib007" />
      </div>
    </div>
  );
};

export default App;
