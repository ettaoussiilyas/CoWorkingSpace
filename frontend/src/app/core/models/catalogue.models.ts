export enum SpaceType {
  PRIVATE_OFFICE = 'PRIVATE_OFFICE',
  CONFERENCE_ROOM = 'CONFERENCE_ROOM',
  OPEN_SPACE = 'OPEN_SPACE',
  TRAINING_ROOM = 'TRAINING_ROOM'
}

export interface Center {
  centerId: number;
  name: string;
  averageRating: number;
  city: string;
  address: string;
  description: string;
  phone?: string;
  email?: string;
  openingHours: string;
  photos: string[];
  isActive?: boolean;
}

export interface Space {
  id: number;
  name: string;
  type: SpaceType;
  description: string;
  capacity: number;
  pricePerHour: number;
  pricePerDay?: number;
  centerId: number;
  averageRating: number;
  photos: string[];
  amenities: string[];
  isActive?: boolean;
}

export interface Availability {
  start: string;
  end: string;
  type: 'BOOKING' | 'MAINTENANCE';
}
