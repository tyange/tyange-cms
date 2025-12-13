import type { POST_STATUS } from '~/constants/post-status.constant'

export interface PostListItem {
  post_id: string
  title: string
  description: string
  published_at: string
  tags: string[]
  content: string
  status: POST_STATUS
}
