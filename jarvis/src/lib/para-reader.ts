import fs from "fs";
import path from "path";

const DEFAULT_LIFE_PATHS = ["../Life", "./Life", "../../Life", "../../../Life"];

function getLifeRoot(): string {
  const envPath = process.env.LIFE_PATH;
  if (envPath) {
    const resolved = path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath);
    if (fs.existsSync(resolved)) return resolved;
  }
  for (const p of DEFAULT_LIFE_PATHS) {
    const resolved = path.join(process.cwd(), p);
    if (fs.existsSync(resolved)) return resolved;
  }
  throw new Error(
    `Life directory not found. Tried: ${DEFAULT_LIFE_PATHS.map((p) => path.join(process.cwd(), p)).join(", ")}. Set LIFE_PATH env.`
  );
}

function readDirSafe(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath);
}

function readFileSafe(filePath: string): string {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Reads all PARA markdown files from the Life directory and compiles them
 * into a single context string for the LLM.
 */
export function getPARAContext(): string {
  const root = getLifeRoot();

  const sections: string[] = [];

  // 1. Daily system (templates and rotation)
  const dailyPath = path.join(root, "Daily", "system.md");
  const dailyContent = readFileSafe(dailyPath);
  if (dailyContent) {
    sections.push("## DAILY SYSTEM (templates, weekday/weekend rotation)\n\n" + dailyContent);
  }

  // 2. Projects
  const projectsDir = path.join(root, "Projects");
  const projectFiles = readDirSafe(projectsDir).filter((f) => f.endsWith(".md"));
  const projectContents = projectFiles
    .map((f) => {
      const name = f.replace(".md", "");
      const content = readFileSafe(path.join(projectsDir, f));
      return `### Project: ${name}\n${content}`;
    })
    .join("\n\n");
  if (projectContents) {
    sections.push("## ACTIVE PROJECTS\n\n" + projectContents);
  }

  // 3. Areas
  const areasDir = path.join(root, "Areas");
  const areaFiles = readDirSafe(areasDir).filter((f) => f.endsWith(".md"));
  const areaContents = areaFiles
    .map((f) => {
      const name = f.replace(".md", "");
      const content = readFileSafe(path.join(areasDir, f));
      return `### Area: ${name}\n${content}`;
    })
    .join("\n\n");
  if (areaContents) {
    sections.push("## AREAS (ongoing responsibilities)\n\n" + areaContents);
  }

  // 4. Resources (summary only - key reference lists)
  const resourcesDir = path.join(root, "Resources");
  const resourceFiles = readDirSafe(resourcesDir).filter((f) => f.endsWith(".md"));
  const resourceContents = resourceFiles
    .map((f) => {
      const name = f.replace(".md", "");
      const content = readFileSafe(path.join(resourcesDir, f));
      return `### Resource: ${name}\n${content.slice(0, 2000)}${content.length > 2000 ? "\n...(truncated)" : ""}`;
    })
    .join("\n\n");
  if (resourceContents) {
    sections.push("## RESOURCES (reference)\n\n" + resourceContents);
  }

  return sections.join("\n\n---\n\n");
}

/**
 * Returns the day-of-week template name and summary from system.md for a given date.
 */
export function getDayTemplate(date: Date): { name: string; summary: string } {
  const root = getLifeRoot();
  const systemPath = path.join(root, "Daily", "system.md");
  const content = readFileSafe(systemPath);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = dayNames[date.getDay()];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const templates: Record<string, { name: string; summary: string }> = {
    Monday: { name: "Strong Start", summary: "Upper body strength, photography theory, first-principles question" },
    Tuesday: { name: "Brain Day", summary: "Cardio, AI concept study, photo editing" },
    Wednesday: { name: "Build Day", summary: "Lower body strength, photography portfolio, concept articulation" },
    Thursday: { name: "Explore Day", summary: "HIIT/swimming, journaling, industry reading" },
    Friday: { name: "Light & Social", summary: "Full body strength, photo practice, week review" },
    Saturday: { name: "Adventure Day", summary: "Long outdoor activity, photo walk, extended reading, style research" },
    Sunday: { name: "Reset Day", summary: "Yoga/recovery, extended reading, mock interview, meal prep, weekly review" },
  };

  const t = templates[day] || { name: "Default", summary: "Balance all areas" };
  return { name: t.name, summary: t.summary };
}
