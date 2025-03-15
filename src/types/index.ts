export interface Sermon {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  preacher: string;
  date: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrls: string[];
  createdAt: string | null;
  updatedAt: string | null;
} 