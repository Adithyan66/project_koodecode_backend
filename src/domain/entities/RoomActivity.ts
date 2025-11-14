

export interface RoomActivity {
  id: string;
  roomId: string;
  userId: string;
  action:
    | 'joined'
    | 'left'
    | 'problem_changed'
    | 'permissions_updated'
    | 'code_updated'
    | 'whiteboard_updated'
    | 'user_kicked'
    | 'user_unkicked'
    | 'message_sent';
  details?: any;
  timestamp: Date;
}
