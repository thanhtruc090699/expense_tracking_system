import { Navigate } from "react-router-dom";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#101828] dark:text-white mb-2 font-arimo">
          Analytics
        </h1>
        <p className="text-[#667085] dark:text-gray-400 font-inter">
          Coming Soon
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    </div>
  );
}
