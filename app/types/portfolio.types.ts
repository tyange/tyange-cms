export interface PortfolioLink {
  label: string
  url: string
}

export interface PortfolioProject {
  slug: string
  title: string
  period: string
  summary: string
  stack: string[]
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
  email: string
  github_url: string
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

export function createEmptyPortfolioDocument(): PortfolioDocument {
  return {
    slug: 'dev',
    version: 1,
    email: '',
    github_url: '',
    featured_projects: [],
    career: {
      summary_label: '',
      summary_value: '',
      companies: [],
    },
  }
}

export function normalizePortfolioDocument(document?: PortfolioDocument | null): PortfolioDocument {
  const base = createEmptyPortfolioDocument()

  if (!document) {
    return base
  }

  return {
    ...base,
    ...document,
    featured_projects: (document.featured_projects ?? []).map(project => ({
      ...project,
      stack: [...(project.stack ?? [])],
      links: (project.links ?? []).map(link => ({ ...link })),
    })),
    career: document.career
      ? {
          summary_label: document.career.summary_label ?? base.career?.summary_label ?? '',
          summary_value: document.career.summary_value ?? base.career?.summary_value ?? '',
          companies: (document.career.companies ?? []).map(company => ({
            ...company,
            items: (company.items ?? []).map(item => ({
              ...item,
              bullets: [...(item.bullets ?? [])],
            })),
          })),
        }
      : base.career,
  }
}
