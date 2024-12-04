export interface Snippet {
  text: string;
  start: number;
  end: number;
  path: string;
}

export type NameSpaces = Record<string, string[]>;

export interface Document extends Snippet {
  score: number;
  text: string;
}

export interface FileEntry {
  name: string;
  content: string;
}

export interface ChangedFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
}

export interface VoyageEmbeddingData {
  object: string;
  embedding: number[];
  index: number;
}

export interface VoyageEmbeddingResponse {
  object: string;
  data: VoyageEmbeddingData[];
  model: string;
  usage: {
    total_tokens: number;
  };
}
