import { useState } from 'react';
import { getRecommendations } from './api';
import { Assessment } from './types';
import { ResultCard } from './components/ResultCard';

function App() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Assessment[]>([]);
    const [error, setError] = useState<string | null>(null);

    const exampleQueries = [
        "Java developer who can collaborate with business teams",
        "Mid-level Python and SQL professional",
        "Analyst with cognitive and personality assessment needs"
    ];

    const handleSearch = async () => {
        if (!query.trim()) {
            setError("Please enter a query or URL");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await getRecommendations(query);
            setResults(res.recommended_assessments);

            if (res.recommended_assessments.length === 0) {
                setError("No assessments found. Try a different query.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to fetch recommendations. Ensure backend is running on port 8000");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        SHL Assessment AI
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Intelligent recommendations powered by LLM and Vector Search
                    </p>
                </header>

                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Enter Job Description or Natural Language Query
                    </label>

                    <div className="relative">
                        <textarea
                            className="w-full p-4 pr-32 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                            rows={4}
                            placeholder="e.g., 'Need a senior Java developer with strong communication skills' or paste a job URL..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />

                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search
                                </>
                            )}
                        </button>
                    </div>

                    {/* Example Queries */}
                    <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Try an example:</p>
                        <div className="flex gap-2 flex-wrap">
                            {exampleQueries.map((ex, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setQuery(ex)}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-8">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {results.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Top {results.length} Recommendations
                            </h2>
                            <div className="text-sm text-gray-500">
                                Sorted by relevance
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {results.map((assessment, index) => (
                                <ResultCard key={index} data={assessment} index={index} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && results.length === 0 && !error && (
                    <div className="text-center py-16">
                        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">
                            Enter a query above to get started
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
