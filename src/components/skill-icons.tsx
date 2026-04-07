"use client";

import { useEffect, useState } from "react";

type TinySkillIconsProps = {
  skills: string[];
  max?: number;
  className?: string;
};

type SkillChipListProps = {
  skills: string[];
  className?: string;
};

export function skillIconSrc(skill: string) {
  return `https://go-skill-icons.vercel.app/api/icons?i=${skill}&titles=false`;
}

function themedSkillIconSrc(skill: string, light: boolean) {
  const base = skillIconSrc(skill);
  return light ? `${base}&theme=light` : base;
}

function useLightMode() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setLight(root.classList.contains("light"));

    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return light;
}

export function SingleSkillIcon({ skill, className = "w-3.5 h-3.5 object-contain opacity-90" }: { skill: string; className?: string }) {
  const light = useLightMode();

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={themedSkillIconSrc(skill, light)} alt={skill} className={className} />
  );
}

export function TinySkillIcons({ skills, max = 4, className = "" }: TinySkillIconsProps) {
  const light = useLightMode();

  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      {skills.slice(0, max).map((skill) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={skill} src={themedSkillIconSrc(skill, light)} alt={skill} className="w-3.5 h-3.5 object-contain opacity-90" />
      ))}
    </div>
  );
}

export function SkillChipList({ skills, className = "" }: SkillChipListProps) {
  const light = useLightMode();

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {skills.map((skill) => (
        <div key={skill} className="inline-flex items-center gap-2 border border-outline-variant/30 bg-surface-container-low px-2.5 py-1.5 text-[10px] font-label uppercase tracking-[0.14em]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={themedSkillIconSrc(skill, light)} alt={skill} className="w-3.5 h-3.5 object-contain" />
          <span>{skill}</span>
        </div>
      ))}
    </div>
  );
}
