import React, { useState, useEffect, useCallback } from 'react';
import { searchLocation } from './services/geminiService';
import { SearchResponse, GeoLocation } from './types';
import MarkdownRenderer from './components/MarkdownRenderer';
import GroundingChips from './components/GroundingChips';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | undefined>(undefined);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [activeMapQuery, setActiveMapQuery] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('granted');
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setLocationStatus('denied');
      }
    );
  }, []);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveMapQuery(null);

    try {
      const data = await searchLocation(query, location);
      setResult(data);
      
      // Auto-select the first map result if available
      const firstMapResult = data.groundingMetadata?.groundingChunks.find(c => c.maps)?.maps?.title;
      if (firstMapResult) {
        setActiveMapQuery(firstMapResult);
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tìm kiếm.");
    } finally {
      setLoading(false);
    }
  }, [query, location]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:block">
              GeoFinder AI
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className={`w-2 h-2 rounded-full ${locationStatus === 'granted' ? 'bg-green-500' : locationStatus === 'requesting' ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'}`}></span>
                <span className="hidden sm:inline">
                  {locationStatus === 'granted' ? 'Đã có vị trí' : locationStatus === 'denied' ? 'Không có vị trí' : locationStatus === 'requesting' ? 'Đang định vị...' : 'Chưa định vị'}
                </span>
             </div>
             <button 
                onClick={requestLocation}
                title="Cập nhật vị trí"
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
             >
                <svg className={`w-4 h-4 ${locationStatus === 'requesting' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col">
        
        {/* Search Box */}
        <div className="mb-8">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bạn muốn tìm địa điểm nào? (VD: Quán phở ngon gần đây)"
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-800 placeholder-slate-400"
              disabled={loading}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Tìm kiếm</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Tìm</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Sử dụng AI Gemini 2.5 Flash với Google Maps Grounding để tìm kiếm chính xác nhất.
          </p>
        </div>

        {/* Results Area */}
        <div className="space-y-6 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold">Lỗi</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 md:p-8">
                      {/* AI Response Text */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-blue-100 p-1.5 rounded-lg">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Kết quả từ AI</span>
                        </div>
                        <MarkdownRenderer content={result.text} />
                      </div>

                      {/* Grounding Data (Maps & Search) */}
                      {result.groundingMetadata && result.groundingMetadata.groundingChunks && (
                        <GroundingChips 
                          chunks={result.groundingMetadata.groundingChunks} 
                          onSelectPlace={(title) => setActiveMapQuery(title)}
                        />
                      )}
                  </div>
                </div>
              </div>
              
              {/* Map Preview Sidebar/Column */}
              <div className="lg:col-span-1">
                 <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[400px] lg:h-[calc(100vh-8rem)]">
                    {activeMapQuery ? (
                      <div className="w-full h-full flex flex-col">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Bản đồ</span>
                          <span className="text-xs text-blue-600 font-medium truncate max-w-[150px]">{activeMapQuery}</span>
                        </div>
                        <iframe
                          title="Google Map"
                          width="100%"
                          height="100%"
                          className="flex-1"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(activeMapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center bg-slate-50">
                         <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                         </svg>
                         <p className="text-sm">Chọn một địa điểm từ kết quả để xem trên bản đồ</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-600 mb-2">Sẵn sàng tìm kiếm</h2>
              <p className="max-w-md mx-auto">Nhập địa điểm, dịch vụ hoặc địa danh bạn muốn tìm kiếm để bắt đầu trải nghiệm tra cứu thông minh.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;