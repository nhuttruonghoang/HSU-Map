export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
            author: string;
            uri: string;
        }[]
    }
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  groundingSupports?: {
    segment: {
      startIndex: number;
      endIndex: number;
    };
    groundingChunkIndices: number[];
    confidenceScores: number[];
  }[];
  webSearchQueries?: string[];
}

export interface SearchResponse {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}
