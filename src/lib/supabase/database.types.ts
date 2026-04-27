export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          company_id: string
          created_at: string
          hours: number
          id: string
          project_id: string | null
          type: string | null
          work_date: string
          worker_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          hours?: number
          id?: string
          project_id?: string | null
          type?: string | null
          work_date?: string
          worker_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          hours?: number
          id?: string
          project_id?: string | null
          type?: string | null
          work_date?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_categories: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      construction_categories: {
        Row: {
          code: string | null
          company_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          amount_excl_tax: number | null
          amount_incl_tax: number | null
          company_id: string
          contract_date: string
          created_at: string
          end_date: string | null
          estimate_id: string | null
          id: string
          memo: string | null
          project_id: string
          start_date: string | null
          tax_amount: number | null
          updated_at: string
        }
        Insert: {
          amount_excl_tax?: number | null
          amount_incl_tax?: number | null
          company_id: string
          contract_date?: string
          created_at?: string
          end_date?: string | null
          estimate_id?: string | null
          id?: string
          memo?: string | null
          project_id: string
          start_date?: string | null
          tax_amount?: number | null
          updated_at?: string
        }
        Update: {
          amount_excl_tax?: number | null
          amount_incl_tax?: number | null
          company_id?: string
          contract_date?: string
          created_at?: string
          end_date?: string | null
          estimate_id?: string | null
          id?: string
          memo?: string | null
          project_id?: string
          start_date?: string | null
          tax_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_categories: {
        Row: {
          code: string | null
          company_id: string
          cost_classification_id: string | null
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: string
          cost_classification_id?: string | null
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: string
          cost_classification_id?: string | null
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_categories_cost_classification_id_fkey"
            columns: ["cost_classification_id"]
            isOneToOne: false
            referencedRelation: "cost_classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_classifications: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_classifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          amount: number
          amount_excl_tax: number | null
          amount_incl_tax: number | null
          category: string
          company_id: string
          construction_category_id: string | null
          cost_category_id: string | null
          cost_classification_id: string | null
          cost_date: string
          created_at: string
          created_by: string | null
          daily_report_id: string | null
          id: string
          item_name: string | null
          memo: string | null
          project_id: string
          quantity: number | null
          registration_type: string | null
          specification: string | null
          supplier_id: string | null
          tax_amount: number | null
          unit_id: string | null
          unit_price: number | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          amount_excl_tax?: number | null
          amount_incl_tax?: number | null
          category: string
          company_id: string
          construction_category_id?: string | null
          cost_category_id?: string | null
          cost_classification_id?: string | null
          cost_date?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string | null
          id?: string
          item_name?: string | null
          memo?: string | null
          project_id: string
          quantity?: number | null
          registration_type?: string | null
          specification?: string | null
          supplier_id?: string | null
          tax_amount?: number | null
          unit_id?: string | null
          unit_price?: number | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          amount_excl_tax?: number | null
          amount_incl_tax?: number | null
          category?: string
          company_id?: string
          construction_category_id?: string | null
          cost_category_id?: string | null
          cost_classification_id?: string | null
          cost_date?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string | null
          id?: string
          item_name?: string | null
          memo?: string | null
          project_id?: string
          quantity?: number | null
          registration_type?: string | null
          specification?: string | null
          supplier_id?: string | null
          tax_amount?: number | null
          unit_id?: string | null
          unit_price?: number | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "costs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_construction_category_id_fkey"
            columns: ["construction_category_id"]
            isOneToOne: false
            referencedRelation: "construction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_cost_category_id_fkey"
            columns: ["cost_category_id"]
            isOneToOne: false
            referencedRelation: "cost_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_cost_classification_id_fkey"
            columns: ["cost_classification_id"]
            isOneToOne: false
            referencedRelation: "cost_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          code: string | null
          company_id: string
          created_at: string
          customer_id: string
          email: string | null
          id: string
          memo: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: string
          created_at?: string
          customer_id: string
          email?: string | null
          id?: string
          memo?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: string
          created_at?: string
          customer_id?: string
          email?: string | null
          id?: string
          memo?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          client_category_id: string | null
          closing_day: number | null
          code: string | null
          company_id: string
          contact: string | null
          created_at: string
          created_by: string | null
          email: string | null
          fax: string | null
          furigana: string | null
          id: string
          memo: string | null
          name: string
          payment_day: number | null
          payment_month_offset: number | null
          payment_terms_memo: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_category_id?: string | null
          closing_day?: number | null
          code?: string | null
          company_id: string
          contact?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          fax?: string | null
          furigana?: string | null
          id?: string
          memo?: string | null
          name: string
          payment_day?: number | null
          payment_month_offset?: number | null
          payment_terms_memo?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_category_id?: string | null
          closing_day?: number | null
          code?: string | null
          company_id?: string
          contact?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          fax?: string | null
          furigana?: string | null
          id?: string
          memo?: string | null
          name?: string
          payment_day?: number | null
          payment_month_offset?: number | null
          payment_terms_memo?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_client_category_id_fkey"
            columns: ["client_category_id"]
            isOneToOne: false
            referencedRelation: "client_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          author_id: string | null
          company_id: string
          content: string | null
          cost_converted: boolean | null
          created_at: string
          end_time: string | null
          id: string
          issues: string | null
          memo: string | null
          project_id: string | null
          report_date: string
          start_time: string | null
          status: string | null
          target_user_id: string | null
          total_person_days: number | null
          updated_at: string
          weather: string | null
          worker_count: number | null
        }
        Insert: {
          author_id?: string | null
          company_id: string
          content?: string | null
          cost_converted?: boolean | null
          created_at?: string
          end_time?: string | null
          id?: string
          issues?: string | null
          memo?: string | null
          project_id?: string | null
          report_date?: string
          start_time?: string | null
          status?: string | null
          target_user_id?: string | null
          total_person_days?: number | null
          updated_at?: string
          weather?: string | null
          worker_count?: number | null
        }
        Update: {
          author_id?: string | null
          company_id?: string
          content?: string | null
          cost_converted?: boolean | null
          created_at?: string
          end_time?: string | null
          id?: string
          issues?: string | null
          memo?: string | null
          project_id?: string | null
          report_date?: string
          start_time?: string | null
          status?: string | null
          target_user_id?: string | null
          total_person_days?: number | null
          updated_at?: string
          weather?: string | null
          worker_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_items: {
        Row: {
          estimate_id: string
          id: string
          name: string
          qty: number
          sort_order: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          estimate_id: string
          id?: string
          name: string
          qty?: number
          sort_order?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          estimate_id?: string
          id?: string
          name?: string
          qty?: number
          sort_order?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          amount_excl_tax: number | null
          amount_incl_tax: number | null
          client_id_for_quotation: string | null
          company_id: string
          cost_amount_excl_tax: number | null
          created_at: string
          deleted_at: string | null
          gross_profit: number | null
          id: string
          internal_memo: string | null
          issue_date: string
          name: string | null
          no: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["quotation_status"] | null
          tax_amount: number | null
          tax_rate: number
          updated_at: string
        }
        Insert: {
          amount_excl_tax?: number | null
          amount_incl_tax?: number | null
          client_id_for_quotation?: string | null
          company_id: string
          cost_amount_excl_tax?: number | null
          created_at?: string
          deleted_at?: string | null
          gross_profit?: number | null
          id?: string
          internal_memo?: string | null
          issue_date?: string
          name?: string | null
          no?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["quotation_status"] | null
          tax_amount?: number | null
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          amount_excl_tax?: number | null
          amount_incl_tax?: number | null
          client_id_for_quotation?: string | null
          company_id?: string
          cost_amount_excl_tax?: number | null
          created_at?: string
          deleted_at?: string | null
          gross_profit?: number | null
          id?: string
          internal_memo?: string | null
          issue_date?: string
          name?: string | null
          no?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["quotation_status"] | null
          tax_amount?: number | null
          tax_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_client_id_for_quotation_fkey"
            columns: ["client_id_for_quotation"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      event_colors: {
        Row: {
          color: string
          company_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color: string
          company_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_colors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      event_resources: {
        Row: {
          company_id: string
          created_at: string
          id: string
          memo: string | null
          name: string
          resource_type: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          memo?: string | null
          name: string
          resource_type?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          memo?: string | null
          name?: string
          resource_type?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_resources_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      file_folders: {
        Row: {
          company_id: string
          created_at: string
          folder_type: string | null
          id: string
          name: string
          parent_folder_id: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          folder_type?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          folder_type?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_folders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "file_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          folder_id: string | null
          id: string
          mime_type: string | null
          name: string
          project_id: string | null
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          name: string
          project_id?: string | null
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string | null
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "file_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          date: string
          id: string
          name: string
        }
        Insert: {
          date: string
          id?: string
          name: string
        }
        Update: {
          date?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      invoice_send_history: {
        Row: {
          body: string | null
          company_id: string
          id: string
          invoice_id: string
          sent_at: string
          sent_by: string | null
          sent_to: string
          status: Database["public"]["Enums"]["send_status"]
          subject: string | null
        }
        Insert: {
          body?: string | null
          company_id: string
          id?: string
          invoice_id: string
          sent_at?: string
          sent_by?: string | null
          sent_to: string
          status?: Database["public"]["Enums"]["send_status"]
          subject?: string | null
        }
        Update: {
          body?: string | null
          company_id?: string
          id?: string
          invoice_id?: string
          sent_at?: string
          sent_by?: string | null
          sent_to?: string
          status?: Database["public"]["Enums"]["send_status"]
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_send_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_send_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          customer_id: string | null
          deleted_at: string | null
          due_date: string | null
          id: string
          internal_memo: string | null
          issue_date: string
          last_paid_at: string | null
          name: string | null
          no: string | null
          original_amount: number | null
          original_paid_amount: number | null
          paid_amount: number | null
          payment_method: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          internal_memo?: string | null
          issue_date?: string
          last_paid_at?: string | null
          name?: string | null
          no?: string | null
          original_amount?: number | null
          original_paid_amount?: number | null
          paid_amount?: number | null
          payment_method?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          internal_memo?: string | null
          issue_date?: string
          last_paid_at?: string | null
          name?: string | null
          no?: string | null
          original_amount?: number | null
          original_paid_amount?: number | null
          paid_amount?: number | null
          payment_method?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      person_day_unit_prices: {
        Row: {
          company_id: string
          created_at: string
          effective_from: string | null
          effective_to: string | null
          id: string
          name: string
          sort_order: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          name: string
          sort_order?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          name?: string
          sort_order?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_day_unit_prices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_albums: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_albums_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_albums_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          album_id: string | null
          caption: string | null
          company_id: string
          created_at: string
          id: string
          project_id: string | null
          storage_path: string
          tag: string | null
          taken_at: string | null
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          company_id: string
          created_at?: string
          id?: string
          project_id?: string | null
          storage_path: string
          tag?: string | null
          taken_at?: string | null
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          company_id?: string
          created_at?: string
          id?: string
          project_id?: string | null
          storage_path?: string
          tag?: string | null
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          code: string | null
          company_id: string
          cost_price: number | null
          created_at: string
          id: string
          memo: string | null
          name: string
          product_category_id: string | null
          specification: string | null
          unit: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: string
          cost_price?: number | null
          created_at?: string
          id?: string
          memo?: string | null
          name: string
          product_category_id?: string | null
          specification?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: string
          cost_price?: number | null
          created_at?: string
          id?: string
          memo?: string | null
          name?: string
          product_category_id?: string | null
          specification?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_category_id_fkey"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      project_assignees: {
        Row: {
          company_id: string
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_assignee_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          project_id: string
          role: Database["public"]["Enums"]["project_assignee_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_assignee_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignees_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_categories: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_statuses: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          is_completed_status: boolean
          is_default: boolean
          is_lost_status: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_completed_status?: boolean
          is_default?: boolean
          is_lost_status?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_completed_status?: boolean
          is_default?: boolean
          is_lost_status?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_statuses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          budget_excl_tax: number | null
          budget_incl_tax: number | null
          budget_tax: number | null
          code: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_contact_id: string | null
          customer_id: string | null
          deleted_at: string | null
          end_date: string | null
          first_contracted_at: string | null
          id: string
          lost_at: string | null
          manager_id: string | null
          memo: string | null
          name: string
          payment_completed_at: string | null
          project_category_id: string | null
          project_status_id: string | null
          received_at: string | null
          request_content: string | null
          site_id: string | null
          start_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          work_started_at: string | null
        }
        Insert: {
          budget?: number | null
          budget_excl_tax?: number | null
          budget_incl_tax?: number | null
          budget_tax?: number | null
          code?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_contact_id?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          end_date?: string | null
          first_contracted_at?: string | null
          id?: string
          lost_at?: string | null
          manager_id?: string | null
          memo?: string | null
          name: string
          payment_completed_at?: string | null
          project_category_id?: string | null
          project_status_id?: string | null
          received_at?: string | null
          request_content?: string | null
          site_id?: string | null
          start_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          work_started_at?: string | null
        }
        Update: {
          budget?: number | null
          budget_excl_tax?: number | null
          budget_incl_tax?: number | null
          budget_tax?: number | null
          code?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_contact_id?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          end_date?: string | null
          first_contracted_at?: string | null
          id?: string
          lost_at?: string | null
          manager_id?: string | null
          memo?: string | null
          name?: string
          payment_completed_at?: string | null
          project_category_id?: string | null
          project_status_id?: string | null
          received_at?: string | null
          request_content?: string | null
          site_id?: string | null
          start_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          work_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_contact_id_fkey"
            columns: ["customer_contact_id"]
            isOneToOne: false
            referencedRelation: "customer_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_category_id_fkey"
            columns: ["project_category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_status_id_fkey"
            columns: ["project_status_id"]
            isOneToOne: false
            referencedRelation: "project_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          name: string
          purchase_order_id: string
          qty: number
          sort_order: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          id?: string
          name: string
          purchase_order_id: string
          qty?: number
          sort_order?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          id?: string
          name?: string
          purchase_order_id?: string
          qty?: number
          sort_order?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          company_id: string
          created_at: string
          delivery_date: string | null
          id: string
          no: string | null
          order_date: string
          project_id: string | null
          status: string | null
          total_amount: number | null
          vendor_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          delivery_date?: string | null
          id?: string
          no?: string | null
          order_date?: string
          project_id?: string | null
          status?: string | null
          total_amount?: number | null
          vendor_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          delivery_date?: string | null
          id?: string
          no?: string | null
          order_date?: string
          project_id?: string | null
          status?: string | null
          total_amount?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_send_history: {
        Row: {
          body: string | null
          company_id: string
          estimate_id: string
          id: string
          sent_at: string
          sent_by: string | null
          sent_to: string
          status: Database["public"]["Enums"]["send_status"]
          subject: string | null
        }
        Insert: {
          body?: string | null
          company_id: string
          estimate_id: string
          id?: string
          sent_at?: string
          sent_by?: string | null
          sent_to: string
          status?: Database["public"]["Enums"]["send_status"]
          subject?: string | null
        }
        Update: {
          body?: string | null
          company_id?: string
          estimate_id?: string
          id?: string
          sent_at?: string
          sent_by?: string | null
          sent_to?: string
          status?: Database["public"]["Enums"]["send_status"]
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_send_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_send_history_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          company_id: string
          created_at: string
          date: string
          id: string
          location: string | null
          memo: string | null
          project_id: string | null
          title: string
        }
        Insert: {
          company_id: string
          created_at?: string
          date: string
          id?: string
          location?: string | null
          memo?: string | null
          project_id?: string | null
          title: string
        }
        Update: {
          company_id?: string
          created_at?: string
          date?: string
          id?: string
          location?: string | null
          memo?: string | null
          project_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string | null
          code: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          fax: string | null
          id: string
          memo: string | null
          name: string
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          fax?: string | null
          id?: string
          memo?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          fax?: string | null
          id?: string
          memo?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_categories: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          code: string | null
          company_id: string
          contact: string | null
          created_at: string
          email: string | null
          id: string
          memo: string | null
          name: string
          phone: string | null
          supplier_category_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          company_id: string
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          memo?: string | null
          name: string
          phone?: string | null
          supplier_category_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          company_id?: string
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          memo?: string | null
          name?: string
          phone?: string | null
          supplier_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_supplier_category_id_fkey"
            columns: ["supplier_category_id"]
            isOneToOne: false
            referencedRelation: "supplier_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      task_categories: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          customer_id: string | null
          due_date: string | null
          end_date: string | null
          id: string
          is_completed: boolean | null
          memo: string | null
          name: string
          progress: number
          project_id: string | null
          sort_order: number
          start_date: string | null
          task_category_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          memo?: string | null
          name: string
          progress?: number
          project_id?: string | null
          sort_order?: number
          start_date?: string | null
          task_category_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          memo?: string | null
          name?: string
          progress?: number
          project_id?: string | null
          sort_order?: number
          start_date?: string | null
          task_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_category_id_fkey"
            columns: ["task_category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          phone: string | null
          role: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_company_id: { Args: never; Returns: string }
    }
    Enums: {
      invoice_status: "unbilled" | "billed" | "partially_paid" | "paid"
      member_role:
        | "owner"
        | "admin"
        | "manager"
        | "worker"
        | "office"
        | "vendor"
      plan_tier: "starter" | "standard" | "business"
      project_assignee_role: "reception" | "sales" | "site_manager"
      project_status: "quoting" | "active" | "completed" | "cancelled"
      quotation_status: "draft" | "submitted" | "won" | "lost"
      send_status: "sent" | "failed" | "opened"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      invoice_status: ["unbilled", "billed", "partially_paid", "paid"],
      member_role: ["owner", "admin", "manager", "worker", "office", "vendor"],
      plan_tier: ["starter", "standard", "business"],
      project_assignee_role: ["reception", "sales", "site_manager"],
      project_status: ["quoting", "active", "completed", "cancelled"],
      quotation_status: ["draft", "submitted", "won", "lost"],
      send_status: ["sent", "failed", "opened"],
    },
  },
} as const
