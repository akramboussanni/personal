import { promises as fs } from "node:fs";
import path from "node:path";
import { BlogPost, Project, SiteConfig } from "@/lib/types";
import { BLOB_STORAGE_ENABLED, readBlobText, writeBlobText } from "@/lib/blob-storage";

type ContentFileName = "projects.json" | "blogs.json" | "site.json";

const bundledContentDir = path.join(process.cwd(), "content-defaults");
const contentDir = process.env.CONTENT_DIR ? path.resolve(process.env.CONTENT_DIR) : bundledContentDir;
async function ensureDirExists() {
  await fs.mkdir(contentDir, { recursive: true });
}

async function exists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getSeedPath(fileName: ContentFileName) {
  return path.join(bundledContentDir, fileName);
}

async function ensureContentFile(fileName: ContentFileName) {
  const target = path.join(contentDir, fileName);
  const bundledFile = getSeedPath(fileName);

  if (await exists(target)) {
    return target;
  }

  const seededRaw = await (async () => {
    if (await exists(bundledFile)) {
      return fs.readFile(bundledFile, "utf8");
    }

    return fileName === "site.json" ? "{}" : "[]";
  })();

  try {
    await ensureDirExists();
    await fs.writeFile(target, seededRaw, "utf8");
    return target;
  } catch {
    if (await exists(bundledFile)) {
      return bundledFile;
    }

    throw new Error(
      `Content file ${fileName} is missing and could not be created in CONTENT_DIR (${contentDir}). Check bind mount permissions.`
    );
  }
}

async function readContent(fileName: ContentFileName): Promise<string> {
  if (BLOB_STORAGE_ENABLED) {
    const blobContent = await readBlobText(fileName);
    if (blobContent !== undefined) return blobContent;
  }

  const contentPath = await ensureContentFile(fileName);
  return fs.readFile(contentPath, "utf8");
}

async function writeContent(fileName: ContentFileName, value: string): Promise<void> {
  if (BLOB_STORAGE_ENABLED) {
    await writeBlobText(fileName, value);
    return;
  }

  await ensureDirExists();
  await fs.writeFile(path.join(contentDir, fileName), value, "utf8");
}

function writeAccessError(fileName: ContentFileName, cause: unknown) {
  const detail = cause instanceof Error ? cause.message : String(cause);
  return new Error(
    `Failed to write ${fileName} in CONTENT_DIR (${contentDir}). Ensure the bind-mounted host folder exists and is writable by the container user. Root cause: ${detail}`
  );
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
  const raw = await readContent("projects.json");
  return (JSON.parse(raw) as Project[]).map(withProjectDefaults);
}

export async function getBlogs(): Promise<BlogPost[]> {
  const raw = await readContent("blogs.json");
  return (JSON.parse(raw) as BlogPost[]).map(withBlogDefaults);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const raw = await readContent("site.json");
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
  try {
    await writeContent("projects.json", JSON.stringify(projects, null, 2));
  } catch (error) {
    throw writeAccessError("projects.json", error);
  }
}

export async function saveBlogs(posts: BlogPost[]): Promise<void> {
  try {
    await writeContent("blogs.json", JSON.stringify(posts, null, 2));
  } catch (error) {
    throw writeAccessError("blogs.json", error);
  }
}

export async function saveSiteConfig(site: SiteConfig): Promise<void> {
  try {
    await writeContent("site.json", JSON.stringify(site, null, 2));
  } catch (error) {
    throw writeAccessError("site.json", error);
  }
}
