

export interface RoomActivity {
  id: string;
  roomId: string;
  userId: string;
  action: 'joined' | 'left' | 'problem_changed' | 'permissions_updated' | 'code_updated' | 'whiteboard_updated';
  details?: any;
  timestamp: Date;
}
