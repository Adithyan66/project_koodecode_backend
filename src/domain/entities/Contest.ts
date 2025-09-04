

export interface Contest {
  _id?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number; 
  problems: string[];
  participants: string[];
  isPublic: boolean;
  maxParticipants?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  rules?: string;
  prizes?: string[];
  createdAt: Date;
  updatedAt: Date;
}
