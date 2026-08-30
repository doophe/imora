export interface PromptItem {
  id: string;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  emoji: string;
  gradient: [string, string];
  /** Local require() image — overrides gradient when present */
  imageSource?: number;
  /** Before/After comparison images for detail sheet */
  beforeImage?: number;
  afterImage?: number;
}

/** Legacy alias kept for ItemCard.tsx */
export interface ListItem {
  id: string;
  text: string;
  imageUri?: string;
  model: string;
  createdAt: Date;
}

export * from './auth';

