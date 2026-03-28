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
}

export interface AlcoholIntakeState {
  bottles: Bottle[];
}
