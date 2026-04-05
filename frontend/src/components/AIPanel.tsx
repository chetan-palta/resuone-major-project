import { useResume } from '../context/ResumeContext';
import { Sparkles, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';

export const AIPanel = () => {
  const { aiScore, aiSuggestions, aiSkillRecommendations, isAnalyzing } = useResume();

  if (isAnalyzing) {
    return (
      <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex items-center justify-center gap-3 mt-6">
        <BrainCircuit className="text-blue-500 animate-pulse" size={24} />
        <span className="text-blue-700 font-medium">AI is analyzing your resume...</span>
      </div>
    );
  }

  if (aiScore === null && aiSuggestions.length === 0 && !aiSkillRecommendations) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="text-blue-600" size={20} />
          AI Resume Suggestions
        </h3>
        {aiScore !== null && (
          <div className={`px-4 py-1.5 rounded-full border font-bold text-sm ${getScoreColor(aiScore)}`}>
            Score: {aiScore}/100
          </div>
        )}
      </div>

      {aiSkillRecommendations && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Recommended Skills</h4>
          <div className="space-y-3">
            {aiSkillRecommendations.languages?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500">Languages:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {aiSkillRecommendations.languages.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {aiSkillRecommendations.tools?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500">Tools/Frameworks:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {aiSkillRecommendations.tools.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {aiSkillRecommendations.databases?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500">Databases:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {aiSkillRecommendations.databases.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {aiSuggestions.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Improvement Areas</h4>
          <div className="space-y-4">
            {aiSuggestions.map((section, sectionIdx) => (
              <div key={sectionIdx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <span className="text-xs font-bold text-blue-600 uppercase mb-2 block">
                  {section.section} #{section.index + 1}
                </span>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="flex gap-2 text-sm text-gray-700">
                      {tip.type === 'weak-verb' || tip.type === 'length' ? (
                        <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                      ) : (
                        <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                      )}
                      <span>
                        {tip.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-100">
          <CheckCircle size={20} />
          <span className="font-medium">No pressing improvements detected! Great job!</span>
        </div>
      )}
    </div>
  );
};
