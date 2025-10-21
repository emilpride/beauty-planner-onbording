'use client'

import { useState } from 'react';
import { SkinAnalysisResult } from '@/app/skin/page';
import SkinAnalysisVisualizer from './SkinAnalysisVisualizer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  result: SkinAnalysisResult;
  originalImage: string;
}

const scoreToSeverity = (score: number) => {
    if (score > 80) return { text: 'Excellent', color: 'text-green-600' };
    if (score > 60) return { text: 'Good', color: 'text-blue-600' };
    if (score > 40) return { text: 'Fair', color: 'text-yellow-600' };
    return { text: 'Needs Attention', color: 'text-red-600' };
};

const renderableAcneTypes = [
    { key: 'acne', name: 'Papules' },
    { key: 'acne_pustule', name: 'Pustules' },
    { key: 'acne_nodule', name: 'Nodules' },
    { key: 'closed_comedones', name: 'Whiteheads' },
    { key: 'blackhead', name: 'Blackheads' },
    { key: 'enlarged_pore_count', name: 'Enlarged Pores' },
];

export default function SkinAnalysisReport({ result, originalImage }: Props) {
  const [activeOverlays, setActiveOverlays] = useState<string[]>(['face_rectangle']);

  if (!result || !result.result) return null;

  const analysis = result.result;
  const scores = analysis.score_info;

  const toggleOverlay = (key: string) => {
    setActiveOverlays(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Your Skin Analysis Report</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Visual Analysis</CardTitle></CardHeader>
                <CardContent>
                    <SkinAnalysisVisualizer result={analysis} originalImage={originalImage} activeOverlays={activeOverlays} />
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Toggle Overlays:</h4>
                        <div className="flex flex-wrap gap-2">
                            {renderableAcneTypes.map(acne => (
                                <button key={acne.key} onClick={() => toggleOverlay(acne.key)} className={`px-3 py-1 text-sm rounded-full ${activeOverlays.includes(acne.key) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {acne.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Overall Scores</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {scores && Object.entries(scores).map(([key, value]) => {
                        const score = value as number;
                        const severity = scoreToSeverity(score);
                        return (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 capitalize">{key.replace('_score', '').replace('_', ' ')}</span>
                                    <span className={`text-sm font-bold ${severity.color}`}>{score} / 100</span>
                                </div>
                                <Progress value={score} className="h-2" />
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Problem Areas</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {renderableAcneTypes.map(acne => {
                            const data = analysis[acne.key];
                            const count = Array.isArray(data?.rectangle) ? data.rectangle.length : (typeof data === 'object' && data !== null ? Object.keys(data).length : 0);
                            if (count > 0) {
                                return <li key={acne.key} className="text-gray-700"><strong>{acne.name}:</strong> {count} detected</li>
                            }
                            return null;
                        })}
                    </ul>
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle>Aging & Wrinkles</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <p><strong>Skin Age:</strong> {analysis.skin_age?.value || 'N/A'}</p>
                    <p><strong>Forehead Wrinkles:</strong> {analysis.forehead_wrinkle_severity?.value > 0 ? `Severity ${analysis.forehead_wrinkle_severity.value}` : 'Not detected'}</p>
                    <p><strong>Crow's Feet (Left):</strong> {analysis.left_crows_feet_severity?.value > 0 ? `Severity ${analysis.left_crows_feet_severity.value}` : 'Not detected'}</p>
                    <p><strong>Eye Finelines (Right):</strong> {analysis.right_eye_finelines_severity?.value > 0 ? `Severity ${analysis.right_eye_finelines_severity.value}` : 'Not detected'}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Eye Area</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <p><strong>Dark Circles:</strong> {analysis.dark_circle?.value > 0 ? `Type ${analysis.dark_circle.value}, Severity ${analysis.dark_circle_severity?.value}` : 'Not detected'}</p>
                    <p><strong>Eye Bags:</strong> {analysis.eye_pouch?.value > 0 ? `Severity ${analysis.eye_pouch_severity?.value}` : 'Not detected'}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}