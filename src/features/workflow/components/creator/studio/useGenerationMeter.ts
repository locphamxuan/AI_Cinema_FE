import { useEffect, useRef, useState } from 'react';

const SIMULATED_DURATION_MS = 3800;
const COMPLETED_BADGE_MS = 5000;

function logForElapsed(elapsedMs: number): string {
  if (elapsedMs < 900) return 'Đang phân tích nội dung…';
  if (elapsedMs < 2100) return 'Đang chọn model phù hợp…';
  if (elapsedMs < 3400) return 'Đang tạo hình ảnh và âm thanh…';
  return 'Đang hoàn thiện clip…';
}

/** Simulated real-time token meter and execution timer shown while a scene is generating. */
export function useGenerationMeter(isGenerating: boolean, targetCost: number) {
  const [progress, setProgress] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [time, setTime] = useState('0.0s');
  const [log, setLog] = useState('');
  const [isCompletedRecently, setIsCompletedRecently] = useState(false);
  const [wasGenerating, setWasGenerating] = useState(isGenerating);
  const startTimeRef = useRef(0);

  // Adjust state while rendering when the generating flag flips (React-recommended over an effect).
  if (isGenerating !== wasGenerating) {
    setWasGenerating(isGenerating);
    if (isGenerating) {
      setIsCompletedRecently(false);
      setProgress(0);
      setTokens(0);
      setLog('Đang phân tích nội dung…');
    } else if (progress > 0) {
      setProgress(100);
      setTokens(targetCost);
      setIsCompletedRecently(true);
    }
  }

  useEffect(() => {
    if (!isGenerating) return;
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const pct = Math.min(100, Math.round((elapsedMs / SIMULATED_DURATION_MS) * 100));
      setTime(`${(elapsedMs / 1000).toFixed(1)}s`);
      setProgress(pct);
      setTokens(Math.min(targetCost, Math.round((pct / 100) * targetCost)));
      setLog(logForElapsed(elapsedMs));
    }, 50);
    return () => clearInterval(timer);
  }, [isGenerating, targetCost]);

  useEffect(() => {
    if (!isCompletedRecently) return;
    const hideTimer = setTimeout(() => setIsCompletedRecently(false), COMPLETED_BADGE_MS);
    return () => clearTimeout(hideTimer);
  }, [isCompletedRecently]);

  return { progress, tokens, time, log, isCompletedRecently };
}
