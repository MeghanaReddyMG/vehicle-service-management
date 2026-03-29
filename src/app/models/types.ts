export type UserRole = 'Admin' | 'User';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  vehicleNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string;
  address?: string;
  registrationDate?: string;
}

export type ServiceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Delivered';

export interface ServiceRecord {
  id: string;
  customerId: string;
  customerName: string;
  vehicleNumber: string;
  serviceDate: string;
  serviceType: string;
  status: ServiceStatus;
  cost: number;
  notes?: string;
}

export interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  category?: 'Parts' | 'Labor' | 'Service';
}

export interface BillingRecord {
  id: string;
  customerId: string;
  customerName: string;
  vehicleNumber: string;
  date: string;
  items: BillingItem[];
  total: number;
  status: string;
}

export interface Reminder {
  id: string;
  vehicleNumber: string;
  serviceType: string;
  dueDate: string;
  daysRemaining: number;
  overdue: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface EstimateItem {
  id: string;
  description: string;
  price: number;
  category: 'Parts' | 'Labor' | 'Service';
}
