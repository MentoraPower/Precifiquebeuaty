/**
 * Tipos do banco (escritos à mão a partir de supabase/migrations/0001_init.sql).
 * Para regenerar automaticamente: `supabase gen types typescript`.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export type Profile = {
  id: string
  full_name: string | null
  profession: string | null
  phone: string | null
  avatar_url: string | null
  plan: string
  onboarding_started_at: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type BusinessSettingsRow = {
  id: string
  user_id: string
  pro_labore_cents: number
  working_days: number
  working_hours_day: number
  default_card_fee_bps: number
  default_tax_bps: number
  default_commission_bps: number
  default_margin_bps: number
  updated_at: string
}

export type BusinessCostRow = {
  id: string
  user_id: string
  type: 'fixed' | 'variable'
  name: string
  category: string | null
  amount_cents: number
  active: boolean
  created_at: string
}

export type InvestmentRow = {
  id: string
  user_id: string
  name: string
  purchase_value_cents: number
  useful_life_months: number
  residual_value_cents: number
  created_at: string
}

export type ProductRow = {
  id: string
  user_id: string
  name: string
  package_price_cents: number
  package_quantity: number
  unit: string
  waste_bps: number
  created_at: string
}

export type ServiceRow = {
  id: string
  user_id: string
  name: string
  icon: string | null
  duration_minutes: number
  additional_cost_cents: number
  current_price_cents: number | null
  suggested_price_cents: number | null
  saved_price_cents: number | null
  base_cost_cents: number | null
  card_fee_bps: number
  tax_bps: number
  partner_commission_bps: number
  desired_margin_bps: number
  result_snapshot_json: Json | null
  status: 'draft' | 'active' | 'inactive'
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type ServiceInputRow = {
  id: string
  service_id: string
  product_id: string
  quantity_used: number
  created_at: string
}

export type ComboRow = {
  id: string
  user_id: string
  name: string
  discount_type: 'percentage' | 'amount'
  discount_value: number
  saved_price_cents: number | null
  active: boolean
  created_at: string
}

export type ComboServiceRow = {
  id: string
  combo_id: string
  service_id: string
  quantity: number
}

export type SimulationRow = {
  id: string
  user_id: string
  type: 'campaign' | 'combo' | 'revenue_goal' | 'discount' | 'price_increase' | 'time_reduction'
  title: string
  payload_json: Json
  result_json: Json | null
  created_at: string
}

export type CampaignRow = {
  id: string
  user_id: string
  name: string
  start_date: string | null
  end_date: string | null
  expected_sales: number
  promotional_price_cents: number | null
  status: 'draft' | 'active' | 'archived'
  result_snapshot_json: Json | null
  created_at: string
  updated_at: string
}

export type CampaignExpenseRow = {
  id: string
  campaign_id: string
  name: string
  category: string
  amount_cents: number
  created_at: string
}

export type CampaignItemRow = {
  id: string
  campaign_id: string
  item_type: 'service' | 'combo'
  service_id: string | null
  combo_id: string | null
  quantity: number
  price_snapshot_cents: number
  base_cost_snapshot_cents: number
  fee_snapshot_json: Json
}

export type EntitlementRow = {
  id: string
  email: string
  status: 'active' | 'refunded' | 'inactive'
  hubla_user_id: string | null
  user_name: string | null
  user_phone: string | null
  group_id: string | null
  group_name: string | null
  transaction_id: string | null
  total_amount_cents: number | null
  paid_at: string | null
  refunded_at: string | null
  last_event: string | null
  raw: Json | null
  created_at: string
  updated_at: string
}

export type CommunityPostRow = {
  id: string
  author_id: string
  body: string | null
  media_url: string | null
  media_type: 'image' | 'video' | null
  created_at: string
}

export type CommunityReactionRow = {
  id: string
  post_id: string
  user_id: string
  emoji: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      entitlements: Table<EntitlementRow>
      profiles: Table<Profile>
      business_settings: Table<BusinessSettingsRow>
      business_costs: Table<BusinessCostRow>
      investments: Table<InvestmentRow>
      products: Table<ProductRow>
      services: Table<ServiceRow>
      service_inputs: Table<ServiceInputRow>
      combos: Table<ComboRow>
      combo_services: Table<ComboServiceRow>
      simulations: Table<SimulationRow>
      campaigns: Table<CampaignRow>
      campaign_expenses: Table<CampaignExpenseRow>
      campaign_items: Table<CampaignItemRow>
      community_posts: Table<CommunityPostRow>
      community_reactions: Table<CommunityReactionRow>
    }
    Views: Record<string, never>
    Functions: {
      email_has_account: {
        Args: { p_email: string }
        Returns: boolean
      }
      grant_access: {
        Args: { p_email: string; p_active: boolean }
        Returns: undefined
      }
      my_entitlement: {
        Args: Record<string, never>
        Returns: EntitlementRow[]
      }
      is_community_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
