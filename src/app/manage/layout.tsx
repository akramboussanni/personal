import { ManageNav } from "@/components/manage/manage-nav";
import { ManageAuthGate } from "@/components/manage/manage-auth-gate";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pt-16 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="font-headline text-3xl uppercase tracking-widest mb-3">Portfolio Manager</h1>
        <p className="text-on-surface-variant text-sm max-w-3xl">
          Proper editor mode. No massive JSON wall. Use the sections below to edit site settings, projects, and blog posts.
        </p>
      </header>
      <ManageAuthGate>
        <ManageNav />
        {children}
      </ManageAuthGate>
    </main>
  );
}
