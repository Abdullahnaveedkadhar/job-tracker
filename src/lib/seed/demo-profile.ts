import type { UserProfile } from "../types";

/**
 * Fictional starter profile used by the "Load starter template" button and the
 * demo account. Shows the shape of a complete profile so new users can edit
 * rather than start from an empty form.
 */
export function buildDemoProfile(email: string): UserProfile {
  return {
    fullName: "Alex Doe",
    email,
    phone: "",
    location: "Manchester, UK",
    summary:
      "Computer Science graduate with commercial experience in React and Next.js. Comfortable owning features end to end, from API design through to accessible, responsive UI. Looking for a graduate software engineering role in a team that reviews code and mentors juniors.",
    skillGroups: [
      {
        id: "skill-frontend",
        category: "Frontend",
        items:
          "React, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS, responsive and mobile-first layouts, component patterns, accessibility (semantic HTML, WCAG-minded UI)",
      },
      {
        id: "skill-backend",
        category: "Backend and data",
        items:
          "Node.js, Python, REST API design, SQL and schema design, PostgreSQL, authentication and authorisation, third-party API integration",
      },
      {
        id: "skill-tooling",
        category: "Tooling and delivery",
        items:
          "Git and GitHub (feature branches, pull requests, code review), CI pipelines, automated testing, Vercel and container-based deploys",
      },
      {
        id: "skill-professional",
        category: "Professional",
        items:
          "Stakeholder communication, technical documentation, agile delivery, estimating and scoping work independently",
      },
    ],
    experience: [
      {
        id: "exp-1",
        title: "Junior Software Engineer",
        company: "Example Software Ltd",
        startDate: "July 2025",
        endDate: "present",
        bullets: [
          "Ship production features end to end across a React front end and a Node API, from ticket refinement through to release",
          "Reduced median dashboard load time from 3.1s to 900ms by paginating a previously unbounded query and memoising expensive renders",
          "Added integration tests around the billing flow, cutting regressions reported by support by roughly half over two quarters",
          "Review pull requests from other juniors and pair with the team lead on architectural decisions",
        ],
      },
      {
        id: "exp-2",
        title: "Software Engineering Intern",
        company: "Example Digital Agency",
        startDate: "June 2024",
        endDate: "September 2024",
        bullets: [
          "Built client-facing marketing sites in Next.js with a headless CMS, deployed on Vercel",
          "Translated design files into accessible, responsive components with keyboard navigation and audited colour contrast",
          "Worked through GitHub feature branches and pull requests, responding to review feedback from senior developers",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        qualification: "BSc (Hons) Computer Science",
        institution: "Example University",
        dates: "2022 to 2025",
        detail:
          "First Class Honours. Modules in software engineering, algorithms and data structures, databases, and distributed systems.",
      },
    ],
    projects: [
      {
        id: "proj-1",
        name: "Open-source contribution: date-parsing library",
        context: "Community project, ~4k GitHub stars",
        dates: "2025",
        bullets: [
          "Fixed a timezone off-by-one affecting DST boundaries, with a regression test covering the reported cases",
          "Change reviewed and merged by maintainers, then shipped in the following minor release",
        ],
      },
      {
        id: "proj-2",
        name: "Allotment watering scheduler",
        context: "Personal project",
        dates: "2024",
        bullets: [
          "Raspberry Pi and Python service that schedules irrigation from soil-moisture readings and a weather API forecast",
          "Exposes a small React dashboard for history and manual overrides; running continuously for over a year",
        ],
      },
    ],
    additionalInfo:
      "Available immediately. Open to hybrid or remote roles across the UK.",
    updatedAt: new Date().toISOString(),
  };
}
