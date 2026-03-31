export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface BookingRequest {
  spaceId: number;
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
}

export interface BookingResponse {
  id: number;
  spaceName: string;
  centerName: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  startDateTime: string;
  endDateTime: string;
  totalPrice: number;
  status: BookingStatus;
  hasReview: boolean;
  paymentMethod?: string;
  paymentStatus?: string;
}
