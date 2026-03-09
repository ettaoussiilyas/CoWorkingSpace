export interface Review {
  id: number;
  userId: number;
  userName: string;
  spaceId: number;
  bookingId: number;
  rating: number;
  comment?: string;
  reported: boolean;
  createdAt: string;
}
