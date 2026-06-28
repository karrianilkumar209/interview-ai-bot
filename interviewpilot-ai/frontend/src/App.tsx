import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import InterviewResult from "./pages/InterviewResult";
import InterviewScreen from "./pages/InterviewScreen";
import InterviewSetup from "./pages/InterviewSetup";
import ReportPage from "./pages/ReportPage";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<InterviewSetup />} />
        <Route path="/interview" element={<InterviewScreen />} />
        <Route path="/result" element={<InterviewResult />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
