import { HomeView } from "@/components/home-view";
import { getBlogs, getProjects, getSiteConfig } from "@/lib/content";

export default async function Home() {
  const [site, projects, blogs] = await Promise.all([getSiteConfig(), getProjects(), getBlogs()]);

  return <HomeView site={site} projects={projects} blogs={blogs} />;
}
