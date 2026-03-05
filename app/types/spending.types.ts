export interface SpendingRecord {
  record_id: number
  amount: number
  merchant: string | null
  transacted_at: string
  created_at: string
}

export interface SpendingListResponse {
  week_key: string
  records: SpendingRecord[]
}

export interface UpsertSpendingRequest {
  amount: number
  merchant: string | null
  transacted_at: string
}
