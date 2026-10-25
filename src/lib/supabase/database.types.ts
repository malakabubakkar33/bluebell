export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          image: string | null;
          is_active: boolean;
          item_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          image?: string | null;
          is_active?: boolean;
          item_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          image?: string | null;
          is_active?: boolean;
          item_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          subtitle: string | null;
          brand: string;
          category_slug: string;
          price: number;
          original_price: number | null;
          discount_percent: number | null;
          image: string;
          gallery: string[] | null;
          rating: number;
          reviews_count: number;
          badge: string | null;
          in_stock: boolean;
          stock_count: number;
          is_best_seller: boolean;
          is_featured: boolean;
          is_new_arrival: boolean;
          specs: Json | null;
          storage_options: string[] | null;
          color_options: Json[] | null;
          warranty: string | null;
          sku: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subtitle?: string | null;
          brand: string;
          category_slug: string;
          price: number;
          original_price?: number | null;
          discount_percent?: number | null;
          image: string;
          gallery?: string[] | null;
          rating?: number;
          reviews_count?: number;
          badge?: string | null;
          in_stock?: boolean;
          stock_count?: number;
          is_best_seller?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          specs?: Json | null;
          storage_options?: string[] | null;
          color_options?: Json[] | null;
          warranty?: string | null;
          sku?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subtitle?: string | null;
          brand?: string;
          category_slug?: string;
          price?: number;
          original_price?: number | null;
          discount_percent?: number | null;
          image?: string;
          gallery?: string[] | null;
          rating?: number;
          reviews_count?: number;
          badge?: string | null;
          in_stock?: boolean;
          stock_count?: number;
          is_best_seller?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          specs?: Json | null;
          storage_options?: string[] | null;
          color_options?: Json[] | null;
          warranty?: string | null;
          sku?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          city: string;
          province: string;
          postal_code: string | null;
          payment_method: 'cod' | 'bank_transfer' | 'easypaisa' | 'jazzcash';
          items: Json;
          subtotal: number;
          shipping_fee: number;
          total: number;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          city: string;
          province: string;
          postal_code?: string | null;
          payment_method: 'cod' | 'bank_transfer' | 'easypaisa' | 'jazzcash';
          items: Json;
          subtotal: number;
          shipping_fee?: number;
          total: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          shipping_address?: string;
          city?: string;
          province?: string;
          postal_code?: string | null;
          payment_method?: 'cod' | 'bank_transfer' | 'easypaisa' | 'jazzcash';
          items?: Json;
          subtotal?: number;
          shipping_fee?: number;
          total?: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: 'new' | 'in_progress' | 'resolved';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: 'new' | 'in_progress' | 'resolved';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          status?: 'new' | 'in_progress' | 'resolved';
          created_at?: string;
        };
      };
    };
  };
}
