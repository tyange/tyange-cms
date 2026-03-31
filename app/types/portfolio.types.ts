import { portfolioDraft } from '~/data/portfolio-draft'

export interface PortfolioLink {
  label: string
  url: string
}

export interface PortfolioIdentity {
  name: string
  role: string
  location: string
  availability: string
  email: string
  github_url: string
  blog_url: string
  velog_url: string | null
}

export interface PortfolioHero {
  eyebrow: string
  headline: string
  summary: string
  primary_cta: PortfolioLink
  secondary_cta: PortfolioLink
}

export interface PortfolioHighlightCard {
  label: string
  title: string
}

export interface PortfolioMetric {
  value: string
  unit: string
  description: string
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

export interface PortfolioAbout {
  eyebrow: string
  headline: string
  paragraphs: string[]
  services: string[]
  strengths: string[]
}

export interface PortfolioWritingSection {
  eyebrow: string
  title: string
  description: string
}

export interface PortfolioCurrentItem {
  name: string
  summary: string
  stack: string[]
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
  hero: PortfolioHero
  highlight_cards: PortfolioHighlightCard[]
  metrics?: PortfolioMetric[]
  guiding_principle: string
  featured_projects: PortfolioProject[]
  about: PortfolioAbout
  writing: PortfolioWritingSection
  career?: PortfolioCareerSection
  currently_building?: PortfolioCurrentItem[]
}

export interface PortfolioResponse {
  portfolio_id: number
  slug: string
  content: PortfolioDocument
  created_at: string
  updated_at: string
}

function clonePortfolioDocument(document: PortfolioDocument): PortfolioDocument {
  return {
    ...document,
    identity: {
      ...document.identity,
    },
    hero: {
      ...document.hero,
      primary_cta: {
        ...document.hero.primary_cta,
      },
      secondary_cta: {
        ...document.hero.secondary_cta,
      },
    },
    highlight_cards: document.highlight_cards.map(card => ({ ...card })),
    metrics: [...(document.metrics ?? [])],
    featured_projects: document.featured_projects.map(project => ({
      ...project,
      stack: [...(project.stack ?? [])],
      highlights: [...(project.highlights ?? [])],
      links: project.links.map(link => ({ ...link })),
    })),
    about: {
      ...document.about,
      paragraphs: [...(document.about.paragraphs ?? [])],
      services: [...(document.about.services ?? [])],
      strengths: [...(document.about.strengths ?? [])],
    },
    writing: {
      ...document.writing,
    },
    career: document.career
      ? {
          ...document.career,
          companies: document.career.companies.map(company => ({
            ...company,
            items: company.items.map(item => ({
              ...item,
              bullets: [...(item.bullets ?? [])],
            })),
          })),
        }
      : undefined,
    currently_building: (document.currently_building ?? []).map(item => ({
      ...item,
      stack: [...(item.stack ?? [])],
    })),
  }
}

export function createEmptyPortfolioDocument(): PortfolioDocument {
  return clonePortfolioDocument(portfolioDraft)
}

export function normalizePortfolioDocument(document?: PortfolioDocument | null): PortfolioDocument {
  const base = createEmptyPortfolioDocument()

  if (!document) {
    return base
  }

  return {
    ...base,
    ...document,
    identity: {
      ...base.identity,
      ...document.identity,
    },
    hero: {
      ...base.hero,
      ...document.hero,
      primary_cta: {
        ...base.hero.primary_cta,
        ...document.hero?.primary_cta,
      },
      secondary_cta: {
        ...base.hero.secondary_cta,
        ...document.hero?.secondary_cta,
      },
    },
    highlight_cards: [...(document.highlight_cards ?? [])],
    metrics: [...(document.metrics ?? [])],
    featured_projects: (document.featured_projects ?? []).map(project => ({
      ...project,
      stack: [...(project.stack ?? [])],
      highlights: [...(project.highlights ?? [])],
      links: (project.links ?? []).map(link => ({ ...link })),
    })),
    about: {
      ...base.about,
      ...document.about,
      paragraphs: [...(document.about?.paragraphs ?? [])],
      services: [...(document.about?.services ?? [])],
      strengths: [...(document.about?.strengths ?? [])],
    },
    writing: {
      ...base.writing,
      ...document.writing,
    },
    career: {
      ...base.career,
      ...document.career,
      companies: (document.career?.companies ?? []).map(company => ({
        ...company,
        items: (company.items ?? []).map(item => ({
          ...item,
          bullets: [...(item.bullets ?? [])],
        })),
      })),
    },
    currently_building: (document.currently_building ?? []).map(item => ({
      ...item,
      stack: [...(item.stack ?? [])],
    })),
  }
}
