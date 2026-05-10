export type Role = 'USER' | 'FARMER' | 'ADMIN';
export type Category = 'all' | 'dairy' | 'meat' | 'eggs' | 'honey' | 'vegetables' | 'fruits';
export type LotStatus = 'active' | 'filled' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'delivering' | 'completed' | 'cancelled';

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  telegramUsername?: string;
  role: Role;
  complexId?: number;
  complexName?: string;
  verified: boolean;
}

export interface Complex {
  id: number;
  name: string;
  district: string;
  address?: string;
}

export interface Farmer {
  id: number;
  name: string;
  description?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
}

export interface Lot {
  id: number;
  title: string;
  description: string;
  category: Category;
  price: number;
  unit: string;
  minOrderQty: number;
  groupTarget: number;
  currentOrders: number;
  deadline: string;
  farmer: Farmer;
  emoji: string;
  photoUrl?: string;
  tags?: string[];
  status: LotStatus;
}

export interface Booking {
  id: number;
  lot: Lot;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  deliveryDate?: string;
}
