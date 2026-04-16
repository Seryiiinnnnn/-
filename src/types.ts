export interface Point {
  x: number;
  y: number;
}

export interface Rider {
  id: string;
  pos: Point;
  targetPos?: Point;
  status: 'idle' | 'delivering';
  velocity: Point;
}

export interface Order {
  id: string;
  customerPos: Point;
  pickupPos: Point;
  riderId?: string;
  status: 'pending' | 'assigned' | 'completed';
  timestamp: number;
  items: string[];
  price: number;
  deliveryTime: number; // in seconds
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
}

export type Category = 'Food' | 'Groceries' | 'Medicine' | 'Daily' | 'Electronics';

export interface SystemStats {
  activeOrders: number;
  onlineRiders: number;
  deliveredToday: number;
  avgDeliverTime: number;
  completedTotal: number;
}
