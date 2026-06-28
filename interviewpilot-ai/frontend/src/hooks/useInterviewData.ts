import { useEffect, useState } from "react";
import { fetchReport, fetchResult } from "../services/interviewService";
import type { ReportResponse, ResultResponse } from "../types/interview";

export function useInterviewData(interviewId?: number) {
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(interviewId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!interviewId) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    Promise.all([fetchResult(interviewId), fetchReport(interviewId)])
      .then(([resultData, reportData]) => {
        if (!active) return;
        setResult(resultData);
        setReport(reportData);
      })
      .catch(() => {
        if (active) setError("Could not load interview results.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [interviewId]);

  return { result, report, loading, error };
}
