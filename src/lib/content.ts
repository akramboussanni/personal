import { promises as fs } from "node:fs";
import path from "node:path";
import { BlogPost, Project, SiteConfig } from "@/lib/types";

const projectsPath = path.join(process.cwd(), "content", "projects.json");
const blogsPath = path.join(process.cwd(), "content", "blogs.json");
const sitePath = path.join(process.cwd(), "content", "site.json");

function withProjectDefaults(project: Project): Project {
  const defaultSpecs = [
    { label: "Year", value: project.year || "" },
    { label: "Category", value: project.category || "" },
  ];

  return {
    ...project,
    skills: Array.isArray(project.skills) ? project.skills : [],
    specs: Array.isArray(project.specs) && project.specs.length ? project.specs : defaultSpecs,
  };
}

function withBlogDefaults(blog: BlogPost): BlogPost {
  return {
    ...blog,
    skills: Array.isArray(blog.skills) ? blog.skills : [],
    markdown: typeof blog.markdown === "string" ? blog.markdown : "",
  };
}

export async function getProjects(): Promise<Project[]> {
  const raw = await fs.readFile(projectsPath, "utf8");
  return (JSON.parse(raw) as Project[]).map(withProjectDefaults);
}

export async function getBlogs(): Promise<BlogPost[]> {
  const raw = await fs.readFile(blogsPath, "utf8");
  return (JSON.parse(raw) as BlogPost[]).map(withBlogDefaults);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const raw = await fs.readFile(sitePath, "utf8");
  const site = JSON.parse(raw) as SiteConfig;

  if (!Array.isArray(site.footerLinks) || !site.footerLinks.length) {
    site.footerLinks = [
      { label: "GitHub", url: "#" },
      { label: "LinkedIn", url: "#" },
    ];
  }

  if (!site.coreSkillGroups || !site.coreSkillGroups.length) {
    site.coreSkillGroups = [{
      label: "Capabilities",
      skills: site.coreSkills,
    }];
  }

  return site;
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogs();
  return posts.find((post) => post.slug === slug);
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2), "utf8");
}

export async function saveBlogs(posts: BlogPost[]): Promise<void> {
  await fs.writeFile(blogsPath, JSON.stringify(posts, null, 2), "utf8");
}

export async function saveSiteConfig(site: SiteConfig): Promise<void> {
  await fs.writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");
}
