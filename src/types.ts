export enum BottleStatus {
  UNOPENED = 'unopened',
  OPENED = 'opened',
  FINISHED = 'finished',
}

export interface Bottle {
  id: string;
  name: string;
  type: string; // e.g., Beer, Wine, Whiskey
  purchaseDate: string; // ISO string
  price: number;
  volume: number; // in ml
  status: BottleStatus;
  openedAt?: string; // ISO string
  finishedAt?: string; // ISO string
  uid: string;
}

export interface Mood {
  id: string;
  date: string; // YYYY-MM-DD
  rating: number; // 1 to 5
  note?: string;
  uid: string;
}

export interface AlcoholIntakeState {
  bottles: Bottle[];
  moods: Mood[];
}
