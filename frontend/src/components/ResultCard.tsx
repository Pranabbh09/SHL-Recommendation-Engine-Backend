import React from 'react';
import { Assessment } from '../types';

interface Props {
    data: Assessment;
    index: number;
}

export const ResultCard: React.FC<Props> = ({ data, index }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                        #{index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>
                </div>

                <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                >
                    View
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>

            {/* Test Type Tags */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {data.test_type.map((tag, idx) => {
                    const colorMap: Record<string, string> = {
                        'Knowledge & Skills': 'bg-purple-100 text-purple-800',
                        'Personality & Behavior': 'bg-green-100 text-green-800',
                        'Cognitive Ability': 'bg-blue-100 text-blue-800',
                    };

                    const color = colorMap[tag] || 'bg-gray-100 text-gray-800';

                    return (
                        <span key={idx} className={`${color} text-xs px-3 py-1 rounded-full font-semibold`}>
                            {tag}
                        </span>
                    );
                })}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {data.description}
            </p>

            {/* Metadata */}
            <div className="flex gap-4 text-sm text-gray-500 border-t pt-3">
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {data.duration} min
                </div>

                <div className="flex items-center gap-1">
                    <svg className={`w-4 h-4 ${data.remote_support === 'Yes' ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0" />
                    </svg>
                    Remote
                </div>

                <div className="flex items-center gap-1">
                    <svg className={`w-4 h-4 ${data.adaptive_support === 'Yes' ? 'text-purple-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Adaptive
                </div>
            </div>
        </div>
    );
};
