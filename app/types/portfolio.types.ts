export interface PortfolioLink {
  label: string
  url: string
}

export interface PortfolioIdentity {
  name: string
  email: string
  github_url: string
  blog_url?: string | null
  velog_url?: string | null
}

export interface PortfolioProject {
  slug: string
  title: string
  period: string
  summary: string
  stack: string[]
  highlights: string[]
  links: PortfolioLink[]
}

export interface PortfolioCareerItem {
  title: string
  period?: string | null
  bullets: string[]
}

export interface PortfolioCareerCompany {
  company: string
  period: string
  employment_type: string
  role: string
  position: string
  items: PortfolioCareerItem[]
}

export interface PortfolioCareerSection {
  summary_label: string
  summary_value: string
  companies: PortfolioCareerCompany[]
}

export interface PortfolioDocument {
  slug: string
  version: number
  identity: PortfolioIdentity
  featured_projects: PortfolioProject[]
  career?: PortfolioCareerSection
}

export interface PortfolioResponse {
  portfolio_id: number
  slug: string
  content: PortfolioDocument
  created_at: string
  updated_at: string
}

export function normalizePortfolioDocument(document?: PortfolioDocument | null): PortfolioDocument | null {
  if (!document) {
    return null
  }

  return {
    slug: document.slug ?? 'dev',
    version: document.version ?? 1,
    identity: {
      name: document.identity?.name ?? '',
      email: document.identity?.email ?? '',
      github_url: document.identity?.github_url ?? '',
      blog_url: document.identity?.blog_url ?? null,
      velog_url: document.identity?.velog_url ?? null,
    },
    featured_projects: (document.featured_projects ?? []).map(project => ({
      ...project,
      stack: [...(project.stack ?? [])],
      highlights: [...(project.highlights ?? [])],
      links: (project.links ?? []).map(link => ({ ...link })),
    })),
    career: document.career
      ? {
          summary_label: document.career.summary_label ?? '',
          summary_value: document.career.summary_value ?? '',
          companies: (document.career.companies ?? []).map(company => ({
            ...company,
            items: (company.items ?? []).map(item => ({
              ...item,
              bullets: [...(item.bullets ?? [])],
            })),
          })),
        }
      : undefined,
  }
}
