import { promises as fs } from "node:fs";
import path from "node:path";
import { BlogPost, Project, SiteConfig } from "@/lib/types";

const bundledContentDir = path.join(process.cwd(), "content-defaults");
const contentDir = process.env.CONTENT_DIR ? path.resolve(process.env.CONTENT_DIR) : bundledContentDir;
const projectsPath = path.join(contentDir, "projects.json");
const blogsPath = path.join(contentDir, "blogs.json");
const sitePath = path.join(contentDir, "site.json");

async function ensureDirExists() {
  await fs.mkdir(contentDir, { recursive: true });
}

async function ensureContentFile(fileName: "projects.json" | "blogs.json" | "site.json") {
  const target = path.join(contentDir, fileName);

  try {
    await fs.access(target);
    return target;
  } catch {
    await ensureDirExists();
  }

  const bundledFile = path.join(bundledContentDir, fileName);
  try {
    const sourceRaw = await fs.readFile(bundledFile, "utf8");
    await fs.writeFile(target, sourceRaw, "utf8");
    return target;
  } catch {
    const fallback = fileName === "site.json" ? "{}" : "[]";
    await fs.writeFile(target, fallback, "utf8");
    return target;
  }
}

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
  const contentPath = await ensureContentFile("projects.json");
  const raw = await fs.readFile(contentPath, "utf8");
  return (JSON.parse(raw) as Project[]).map(withProjectDefaults);
}

export async function getBlogs(): Promise<BlogPost[]> {
  const contentPath = await ensureContentFile("blogs.json");
  const raw = await fs.readFile(contentPath, "utf8");
  return (JSON.parse(raw) as BlogPost[]).map(withBlogDefaults);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const contentPath = await ensureContentFile("site.json");
  const raw = await fs.readFile(contentPath, "utf8");
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
  await ensureDirExists();
  await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2), "utf8");
}

export async function saveBlogs(posts: BlogPost[]): Promise<void> {
  await ensureDirExists();
  await fs.writeFile(blogsPath, JSON.stringify(posts, null, 2), "utf8");
}

export async function saveSiteConfig(site: SiteConfig): Promise<void> {
  await ensureDirExists();
  await fs.writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");
}
