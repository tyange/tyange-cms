import type { POST_STATUS } from '~/constants/post-status.constant'

export interface Tag {
  tag: string
  category: string
}

export interface PostListItem {
  post_id: string
  title: string
  description: string
  published_at: string
  tags: Tag[]
  content: string
  status: POST_STATUS
}

export interface TagWithCategory {
  category: string
  tags: string[]
}
