export interface GiftRequest {
  nickname: string;
  gender: string; // 'male' | 'female' | 'other'
  relation: string; // '伴侣' | '朋友' | '长辈' | '孩子' | Custom input
  occasion: string;
  budgetMin: number;
  budgetMax: number;
  interests: string[];
  remarks: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  source: '京东' | '天猫' | '淘宝' | '亚马逊';
  link: string;
  tags: string[]; // e.g., '高性价比', '热销'
  keywords: string; // The AI keyword that generated this
}

export interface RecipientProfile {
  id: string;
  nickname: string;
  relation: string;
  savedProducts: Product[];
  lastRequest?: GiftRequest;
}

export enum LoadingStage {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // AI Thinking
  GENERATING = 'GENERATING', // AI Generating Keywords
  SEARCHING = 'SEARCHING', // Searching Products
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AiKeywordResponse {
  keywords: string[];
  reasoning: string;
}