import React from 'react';
import { GroundingChunk } from '../types';

interface GroundingChipsProps {
  chunks: GroundingChunk[];
  onSelectPlace?: (title: string) => void;
}

const GroundingChips: React.FC<GroundingChipsProps> = ({ chunks, onSelectPlace }) => {
  const mapChunks = chunks.filter((c) => c.maps);
  const webChunks = chunks.filter((c) => c.web);

  if (mapChunks.length === 0 && webChunks.length === 0) return null;

  return (
    <div className="space-y-8 mt-6 border-t border-slate-200 pt-6">
      {/* Maps Section */}
      {mapChunks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Địa điểm tìm thấy
          </h3>
          <div className="flex flex-col gap-4">
            {mapChunks.map((chunk, idx) => {
              const snippet = chunk.maps?.placeAnswerSources?.reviewSnippets?.[0]?.content;
              
              return (
                <div
                  key={`map-${idx}`}
                  className="group block p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                     if (chunk.maps?.title && onSelectPlace) {
                       onSelectPlace(chunk.maps.title);
                     }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon Box */}
                    <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {chunk.maps?.title || "Vị trí không tên"}
                        </h4>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap border border-slate-200 rounded px-1.5 py-0.5">
                          Google Maps
                        </span>
                      </div>
                      
                      {snippet && (
                        <p className="text-slate-600 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                          "{snippet}"
                        </p>
                      )}

                      <div className="flex gap-3 mt-3">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium hover:bg-blue-100 transition-colors">
                            Xem bản đồ
                          </span>
                          <a 
                             href={chunk.maps?.uri}
                             target="_blank"
                             rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 px-2 py-1 transition-colors"
                          >
                              Mở trong tab mới
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                          </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Web Search Section */}
      {webChunks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Nguồn tham khảo
          </h3>
          <div className="flex flex-col gap-2">
            {webChunks.map((chunk, idx) => (
              <a
                key={`web-${idx}`}
                href={chunk.web?.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mr-3">
                    <span className="text-xs font-bold">W</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700">{chunk.web?.title}</div>
                    <div className="text-xs text-slate-400 truncate">{chunk.web?.uri}</div>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroundingChips;