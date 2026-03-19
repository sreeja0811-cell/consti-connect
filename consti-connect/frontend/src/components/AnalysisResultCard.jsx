import React from 'react';

/**
 * A reusable card component to display a single analysis result.
 * It shows the article, similarity score, and a progress bar.
 */
export default function AnalysisResultCard({ article, index }) {
  // Convert similarity (e.g., 0.89) to a percentage string (e.g., "89.0%")
  const similarityScore = (article.similarity * 100).toFixed(1);
  const barWidth = `${similarityScore}%`;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-700">
      <div className="p-5">
        {/* Header with Match # and Score */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-blue-400 bg-blue-900/50 px-3 py-1 rounded-full">
            Match #{index + 1}
          </span>
          <span className="text-lg font-bold text-green-400">{similarityScore}% Relevant</span>
        </div>
        
        {/* Article Title */}
        <h3 className="text-xl font-bold text-white mb-2">
          {article.article_number}: {article.title || "Constitutional Provision"}
        </h3>
        
        {/* Article Text */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {article.full_text}
        </p>
        
        {/* Similarity progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: barWidth }}
            title={`${similarityScore}% similarity`}
          ></div>
        </div>
      </div>
    </div>
  );
}

