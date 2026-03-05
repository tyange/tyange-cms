export interface RemainingWeeklyBudgetBucket {
  bucket_index: number
  from_date: string
  to_date: string
  days: number
  amount: number
}

export interface RemainingWeeklyBudgetData {
  total_budget: number
  period_start: string
  period_end: string
  as_of_date: string
  spent_net: number
  remaining_budget: number
  remaining_days: number
  is_overspent: boolean
  buckets: RemainingWeeklyBudgetBucket[]
}

export interface RemainingWeeklyBudgetApiResponse {
  status: boolean
  data: RemainingWeeklyBudgetData | null
  message: string | null
}
