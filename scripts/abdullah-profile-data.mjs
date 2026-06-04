/** DB row shape for profiles table — shared by seed-profile.mjs */

export function buildProfileRow(email) {
  return {
    full_name: "Abdullah Naveed",
    email,
    phone: "",
    location: "Atlantic Point, Liverpool, UK",
    summary:
      "BSc (Hons) Computer Science graduate with practical experience in AI assisted software, full stack web development and applied machine learning. Currently building LLM driven workflows, APIs and Cesium based 3D viewers for drone site surveys and delivering accessible React and Next.js applications for commercial clients. Dissertation work combined computer vision, reinforcement learning and robotics simulation for an industrial recycling partner, with measured throughput and pick rate improvements. Seeking a graduate role where strong engineering, prompt design and clear communication support energy innovation and Net Zero goals.",
    skill_groups: [
      {
        id: "skill-ai",
        category: "AI and LLM",
        items:
          "Prompt engineering and output review across Claude, ChatGPT and Gemini; evaluation of model responses for production workflows; applied ML (object detection, reinforcement learning); Python for AI pipelines and tooling",
      },
      {
        id: "skill-fullstack",
        category: "Full stack development",
        items:
          "Python, JavaScript, SQL, Java, HTML and CSS; React, Next.js and Gatsby; REST APIs; dashboard and portal style applications; geospatial 3D viewers (Cesium)",
      },
      {
        id: "skill-cloud",
        category: "Cloud and data",
        items:
          "AWS, Azure and Vercel; database design and integration; data handling, visualisation and reporting; Git and GitHub workflows",
      },
      {
        id: "skill-professional",
        category: "Professional",
        items:
          "Stakeholder communication, agile delivery, technical documentation, accessibility focused UI design, independent problem solving",
      },
    ],
    experience: [
      {
        id: "exp-drone",
        title: "Graduate Software Developer",
        company: "Drone Site Surveys",
        startDate: "May 2026",
        endDate: "present",
        bullets: [
          "Building web dashboards and 3D viewers with Cesium to present drone capture and site survey models to internal and client users",
          "Designing, testing and refining prompts across Claude, ChatGPT and Gemini to improve the reliability and usefulness of AI assisted features",
          "Developing and integrating APIs and database layers to connect survey data, application logic and front end views",
          "Improving existing tooling by extending viewers, tightening data flows and making technical outputs easier to explore and act on",
        ],
      },
      {
        id: "exp-attach",
        title: "Junior Software Developer Intern",
        company: "ATTACH Digital",
        startDate: "May 2026",
        endDate: "present",
        bullets: [
          "Completed structured training across React, JavaScript, Next.js, Gatsby, CSS and Python based project workflows",
          "Supporting front end delivery on client projects under senior developer guidance using modern JavaScript stacks",
          "Applying component based UI patterns and version control practices ready for ongoing billable project work",
        ],
      },
      {
        id: "exp-jamescape",
        title: "Software Developer Intern (Web)",
        company: "Jamescape",
        startDate: "February 2026",
        endDate: "April 2026",
        bullets: [
          "Contributing to a full company website revamp in Next.js to present Disability Confident SaaS and wider equality, diversity and inclusion services",
          "Working with the COO and development team to turn business requirements into site structure, content and user journeys",
          "Implementing accessible, responsive UI with semantic HTML, strong contrast, clear typography and keyboard friendly navigation",
          "Managing work through GitHub feature branches and pull requests, responding to review feedback and keeping documentation current",
        ],
      },
      {
        id: "exp-vizbox",
        title: "App Developer Intern",
        company: "Viz Box Ltd",
        startDate: "October 2025",
        endDate: "January 2026",
        bullets: [
          "Designed and built a Flutter mobile application to help stroke survivors manage fatigue and therapy related tasks",
          "Gathered requirements with therapists and non technical stakeholders and translated them into clear, accessible user flows",
          "Delivered a production ready prototype with more than 30 screens within a 100 hour internship using iterative delivery",
          "Integrated APIs and structured the codebase for real world use and future extension",
        ],
      },
      {
        id: "exp-optimal",
        title: "Production Simulation and MES Intern",
        company: "Optimal Health Performance Ltd",
        startDate: "July 2025",
        endDate: "September 2025",
        bullets: [
          "Built Simul8 models to forecast capacity and optimise workflows for wellness equipment production lines",
          "Configured and tested Tascus MES workflows to improve traceability and shop floor data capture",
          "Mapped processes with operations staff and delivered results under tight deadlines with early risk escalation",
        ],
      },
      {
        id: "exp-organica",
        title: "Manufacturing Simulation and Data Analyst Intern",
        company: "Organica Ltd",
        startDate: "March 2025",
        endDate: "May 2025",
        bullets: [
          "Learnt Simul8 from scratch and built discrete event models of production lines for major retail clients",
          "Collected and cleaned production data to parameterise models and analyse throughput and bottlenecks",
          "Documented assumptions and results so models could be reused; received positive feedback from management",
        ],
      },
      {
        id: "exp-ambassador",
        title: "International Student Ambassador",
        company: "Liverpool John Moores University",
        startDate: "August 2024",
        endDate: "present",
        bullets: [
          "Supported international student intakes with registration, campus guidance and applicant queries across channels",
          "Created social media content and supported marketing events; awarded Ambassador of the Month for reliable service",
        ],
      },
    ],
    education: [
      {
        id: "edu-ljmu",
        qualification: "BSc (Hons) Computer Science",
        institution: "Liverpool John Moores University",
        dates: "2023 to 2026",
        detail:
          "Software development, algorithms, databases, artificial intelligence, robotics and embedded systems. Graduated June 2026. Dissertation awarded 91%",
      },
      {
        id: "edu-aspire",
        qualification: "Higher secondary education",
        institution: "Aspire College",
        dates: "2020 to 2022",
        detail: "Mathematics, physics and computer science",
      },
    ],
    projects: [
      {
        id: "proj-fyp",
        name: "AI driven robotic depalletisation and box processing (Dissertation)",
        context: "Roberts Recycling Ltd",
        dates: "September 2025 to April 2026",
        bullets: [
          "Designed and evaluated an automated depalletising and box opening cell in Webots with an ABB IRB 4600 robot, overhead vision and conveyor workflow",
          "Trained a YOLOv8 detector using self supervised labels from simulation; built a DQN pick advisor and IKNet correction for reliable grasping",
          "Achieved roughly 106 boxes per hour in simulation against a 40 boxes per hour manual baseline, with 88% pick success in formal evaluation",
          "Validated perception concepts with an Intel RealSense D435 prototype and Arduino control layer for simulation to hardware transfer",
        ],
      },
      {
        id: "proj-guide-dog",
        name: "AI guide dog robot for blind users",
        context: "Second year team project",
        dates: "January 2025 to April 2025",
        bullets: [
          "Led development of a robotic guide concept on a Unitree GO2 with Intel depth cameras, Python controllers and ROS",
          "Delivered route planning and execution as a lower cost assistive technology alternative to traditional guide dogs",
        ],
      },
    ],
    additional_info:
      "Recently graduated with full degree results (June 2026). Available for graduate roles now. Happy to work hybrid in Ellesmere Port. Strong interest in applying AI within regulated, industrial and energy contexts.",
    updated_at: new Date().toISOString(),
  };
}
