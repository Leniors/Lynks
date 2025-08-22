export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar?: string | null;
  bio?: string | null;
  theme?: string | null;
}

export interface Theme {
  backgroundColor: string;
  cardBackground: string;
  primaryColor: string;
  textColor: string;
  buttonStyle: string;
  fontFamily: string;
  borderRadius: string;
}

export interface CommerceSettings {
  id: string; // uuid
  user_id: string | null; // references auth.users.id
  enable_link_monetization: boolean; // default false
  subscription_gateway: boolean; // default false
  revenue_analytics: boolean; // default true
  payment_methods: string[]; // text[]
  updated_at: string; // timestamp with time zone (ISO string)
}

export interface LinkClick {
  id: string;               // uuid
  link_id: string;          // uuid
  clicked_at: string | null; // timestamp with time zone (ISO string) or null if not set
  visitor_id?: string | null; // text, optional
}

// ✅ Links table
export interface UserLink {
  id: string;               // uuid
  user_id: string;          // uuid -> profiles.id
  title: string;
  url: string;
  icon?: string | null;
  color?: string | null;
  is_visible: boolean;      // default true
  created_at: string | null; // timestamp (ISO string) | null
  clicks: number;           // integer default 0
  is_paid: boolean;         // default false
}

// ✅ Payments table
export type PaymentStatus = "completed" | "pending" | "failed";
export type PaymentProvider = "stripe" | "mpesa";

export interface Payment {
  id: string;               // uuid
  link_id: string;          // uuid -> links.id
  user_email: string;
  amount: number;           // numeric
  status: PaymentStatus;    // enum constraint
  provider: PaymentProvider;
  created_at: string | null; // timestamp
}

// ✅ Products table
export interface Product {
  id: string;               // uuid
  user_id?: string | null;  // uuid -> auth.users.id
  name: string;
  description?: string | null;
  price: number;            // numeric
  currency: string;         // default 'USD'
  image_url?: string | null;
  created_at: string | null;
  updated_at: string | null;
  published?: boolean | null;
}

// ✅ Profiles table
export interface Profile {
  id: string;               // uuid -> auth.users.id
  username?: string | null;
  full_name?: string | null;
  avatar?: string | null;
  created_at: string;       // timestamp
  updated_at: string;       // timestamp
  email?: string | null;
  bio?: string | null;
  theme?: string | null;
}

// ✅ Subscription Plans table
export type SubscriptionPlanStatus = "active" | "draft";

export interface SubscriptionPlan {
  id: string;               // uuid
  name: string;
  price: number;            // numeric
  currency: string;         // default 'USD'
  description?: string | null;
  features: string[];       // text[]
  status: SubscriptionPlanStatus;
  created_at: string | null;
  user_id?: string | null;  // uuid -> auth.users.id
}

// ✅ Subscriptions table
export type SubscriptionStatus = "active" | "canceled";

export interface Subscription {
  id: string;               // uuid
  user_email: string;
  plan?: string | null;
  status: SubscriptionStatus;
  created_at: string | null;
}

// ✅ Transactions table
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;               // uuid
  user_email: string;
  amount: number;           // numeric
  plan?: string | null;
  status: TransactionStatus;
  created_at: string | null;
}
