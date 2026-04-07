export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "quote"; text: string };

export type FeaturedDetails = {
  problem: string;
  approach: string;
  impact: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  category: string;
  specs?: Array<{
    label: string;
    value: string;
  }>;
  accent: string;
  featured: boolean;
  heroImage?: string;
  skills: string[];
  content: ContentBlock[];
  featuredDetails?: FeaturedDetails;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  accent: string;
  heroImage?: string;
  skills: string[];
  markdown?: string;
  content: ContentBlock[];
};

export type SiteConfig = {
  brand: string;
  defaultAccent: string;
  rotatingSecondWords: string[];
  rotatingThirdWords: string[];
  coreSkills: string[];
  footerLinks: Array<{
    label: string;
    url: string;
  }>;
  coreSkillGroups?: Array<{
    label: string;
    skills: string[];
    tone?: string;
  }>;
};
