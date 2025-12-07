import React, { useEffect, useState } from 'react';
import { LoadingStage } from '../types';

interface LoadingOverlayProps {
  stage: LoadingStage;
  generatedKeywords: string[];
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ stage, generatedKeywords }) => {
  const [displayText, setDisplayText] = useState("正在分析送礼对象画像...");
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (stage === LoadingStage.ANALYZING) {
      setDisplayText("正在分析送礼对象画像...");
      setProgress(30);
    } else if (stage === LoadingStage.GENERATING) {
      setDisplayText("AI 顾问已生成灵感...");
      setProgress(60);
    } else if (stage === LoadingStage.SEARCHING) {
      setDisplayText("正在为您挑选最合适的礼物…");
      setProgress(90);
    }
  }, [stage]);

  if (stage === LoadingStage.IDLE || stage === LoadingStage.COMPLETED || stage === LoadingStage.ERROR) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-macaron-bg/95 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-xs text-center space-y-8 p-6">
        
        {/* Animated Icon */}
        <div className="text-6xl animate-bounce-slow">
          {stage === LoadingStage.ANALYZING && "🤔"}
          {stage === LoadingStage.GENERATING && "💡"}
          {stage === LoadingStage.SEARCHING && "🔎"}
        </div>

        {/* Text Status */}
        <h3 className="text-xl font-display font-bold text-macaron-textMain animate-pulse whitespace-nowrap">
          {displayText}
        </h3>

        {/* Dynamic Keywords Cloud (Phase 2) */}
        {stage !== LoadingStage.ANALYZING && generatedKeywords.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
             {generatedKeywords.map((kw, idx) => (
               <span 
                key={idx} 
                className="px-3 py-1 bg-macaron-purple/30 rounded-full text-sm text-macaron-textMain animate-jelly"
                style={{ animationDelay: `${idx * 100}ms` }}
               >
                 {kw}
               </span>
             ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-macaron-pink transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
