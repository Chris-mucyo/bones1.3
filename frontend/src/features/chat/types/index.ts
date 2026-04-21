export interface Message {
  id:         string;
  senderId:   string;
  receiverId: string;
  content:    string;
  type:       'text' | 'image' | 'listing';
  listingRef?: {
    id:    string;
    title: string;
    price: number;
    image: string;
  };
  read:       boolean;
  createdAt:  string;
}

export interface Conversation {
  id:            string;
  participants:  string[];
  otherUser: {
    id:       string;
    name:     string;
    avatar?:  string;
    shopName?: string;
    online:   boolean;
  };
  lastMessage:   Message | null;
  unreadCount:   number;
  updatedAt:     string;
}
