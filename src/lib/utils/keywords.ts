const SKILLS = [
  "python",
  "java",
  "c++",
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node",
  "sql",
  "postgresql",
  "aws",
  "docker",
  "kubernetes",
  "machine learning",
  "data analysis",
  "algorithms",
  "system design",
  "git",
  "linux",
  "go",
  "rust",
];

export type ParsedJobDescription = {
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  yearsOfExperience: string[];
};

export function extractKeywords(jobDescription: string): ParsedJobDescription {
  const lines = jobDescription
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const lower = jobDescription.toLowerCase();
  const skills = SKILLS.filter((skill) => lower.includes(skill));
  const yearsOfExperience = Array.from(lower.matchAll(/\b([0-9]+)\+?\s+years?\b/g)).map((m) => m[0]);

  const responsibilities = lines.filter((line) =>
    /responsibil|you will|what you('?| )ll do|day-to-day/i.test(line),
  );
  const requirements = lines.filter((line) =>
    /requirement|qualification|must have|preferred|experience/i.test(line),
  );

  return {
    responsibilities: responsibilities.slice(0, 8),
    requirements: requirements.slice(0, 8),
    skills,
    yearsOfExperience,
  };
}
