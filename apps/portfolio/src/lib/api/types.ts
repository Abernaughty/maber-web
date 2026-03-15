export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  imageUrl?: string;
  liveUrl?: string;
  sourceUrl?: string;
  featured: boolean;
  createdAt: string;
  content?: string;
}
