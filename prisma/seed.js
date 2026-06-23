const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { scryptSync, randomBytes } = require("crypto");

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashedPassword}`;
}

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing records (using transactional deletes)
  await prisma.timelineItem.deleteMany();
  await prisma.brief.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.message.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const clientUser = await prisma.user.create({
    data: {
      email: "client@acme.com",
      password: hashPassword("password"),
      role: "client",
      name: "Acme Corp",
    },
  });

  const ownerUser = await prisma.user.create({
    data: {
      email: "surya@buildwithssp.com",
      password: hashPassword("password"),
      role: "owner",
      name: "Surya Prakash S",
      mobile: "6383513214",
    },
  });

  const superAdminUser = await prisma.user.create({
    data: {
      email: "sspsurya2002@gmail.com",
      password: hashPassword("Sasuke@2002#"),
      role: "owner",
      name: "Surya Prakash S",
      mobile: "6383513214",
    },
  });

  console.log("Seeded Users:", { clientUser, ownerUser, superAdminUser });

  // 3. Seed Initial Project
  const project = await prisma.project.create({
    data: {
      id: "proj-1",
      name: "Schedultron Calendaring Module",
      description: "Interactive scheduling calendar engine supporting timezone handling and booking automation.",
      status: "In Review",
      progress: 60,
      phase: "Development",
      clientId: clientUser.id,
    },
  });

  console.log("Seeded Project:", project.name);

  // 4. Seed Deliverables
  const deliverables = [
    { id: "del-1", name: "User Flow & UX Wireframes", phase: "Discovery", status: "approved" },
    { id: "del-2", name: "High-Fidelity Figma Prototypes", phase: "Design", status: "approved" },
    { id: "del-3", name: "API Security Contracts & Protocol spec", phase: "Development", status: "pending", link: "https://github.com/surya9122prakash" },
    { id: "del-4", name: "Interactive Calendar Engine UI", phase: "Testing", status: "pending" },
  ];

  for (const del of deliverables) {
    await prisma.deliverable.create({
      data: {
        ...del,
        projectId: project.id,
      },
    });
  }

  // 5. Seed Invoices
  const invoices = [
    { id: "inv-1", title: "Discovery Phase Scope Sign-off", amount: 1500, status: "paid", dueDate: "04/10/2026" },
    { id: "inv-2", title: "Design Prototypes Confirmed", amount: 2500, status: "paid", dueDate: "05/15/2026" },
    { id: "inv-3", title: "Frontend UI & Core API Release", amount: 4000, status: "pending", dueDate: "06/25/2026" },
    { id: "inv-4", title: "Testing & Final Launch Handoff", amount: 4000, status: "locked", dueDate: "07/15/2026" },
  ];

  for (const inv of invoices) {
    await prisma.invoice.create({
      data: {
        ...inv,
        projectId: project.id,
      },
    });
  }

  // 6. Seed Messages
  const messages = [
    { id: "msg-1", sender: "owner", text: "Hey! Welcome to your project dashboard. I've finished the core architecture of Schedultron and updated the progress track.", time: "10:14 AM" },
    { id: "msg-2", sender: "client", text: "Awesome. I see the progress is at 60%. What deliverables need my review next?", time: "10:15 AM" },
    { id: "msg-3", sender: "owner", text: "I uploaded the API Security Contracts in the 'Deliverables' tab. Please review and approve it or submit your revision notes.", time: "10:16 AM" },
  ];

  for (const msg of messages) {
    await prisma.message.create({
      data: {
        ...msg,
        projectId: project.id,
      },
    });
  }

  // 7. Seed Meetings
  await prisma.meeting.create({
    data: {
      id: "meet-1",
      clientName: "Acme Corp",
      date: "2026-06-20",
      time: "10:00 AM",
      topic: "Development Sync & Mid-Milestone Demo",
      duration: "30 mins",
      link: "https://meet.google.com/xyz-abcd-efg",
      projectId: project.id,
    },
  });

  // 8. Seed Briefs
  const brief = await prisma.brief.create({
    data: {
      id: "brief-1",
      clientName: "Cyberdyne Systems",
      projectName: "Neural Net Training Dashboard",
      budget: 25000,
      description: "Need a high-fidelity dashboard to monitor deep-learning agent training runs with real-time web-socket logs.",
      status: "pending",
    },
  });

  console.log("Seeded Briefs:", brief.projectName);

  // 9. Seed Timeline Items (Portfolio Experience & Projects)
  const timelineItems = [
    {
      type: "Work Experience",
      title: "Software Engineer II",
      subtitle: "Payoda Technologies Pvt Ltd",
      period: "03/2024 - Present",
      details: JSON.stringify([
        "Improved SSR-based Nuxt.js applications by reducing page load time by approximately 40% and boosting SEO scores by 25% across production modules.",
        "Developed a scheduling system that supports 1,500+ concurrent users and handling 800+ bookings per day, with time-zone handling workflows and chatbot automation.",
        "Integrated REST APIs and Socket.io to enable real-time communication for high-concurrent user activity, achieving less than 100ms average event latency.",
        "Built a reusable components and shared UI component library, reducing duplicate development effort approximately by 30%."
      ]),
      tags: JSON.stringify(["Nuxt.js", "Vue.js", "Node.js", "Socket.io", "REST APIs"]),
      image: "/images/company.avif",
      link: "#",
      order: 0
    },
    {
      type: "Featured Project",
      title: "Schedultron",
      subtitle: "React Calendar & DatePicker Library",
      period: "Personal Project",
      details: JSON.stringify([
        "Published a reusable scheduling library with 600+ downloads on NPM.",
        "Optimized calendar rendering engines for Day, Week, and Month views, featuring custom styling hooks and seamless date manipulation."
      ]),
      tags: JSON.stringify(["React.js", "TypeScript", "NPM Library", "Calendar Engine"]),
      image: "/images/schedultron.PNG",
      link: "https://schedultron-live.vercel.app/",
      order: 1
    },
    {
      type: "Featured Project",
      title: "Connectro",
      subtitle: "Micro-frontend Social Platform",
      period: "Personal Project",
      details: JSON.stringify([
        "Built a micro-frontend social media platform with independent deployments utilizing Single-SPA.",
        "Implemented real-time messaging, notifications, media sharing, and Socket.io event-driven architecture."
      ]),
      tags: JSON.stringify(["React.js", "Vue.js", "Single-SPA", "Node.js", "MongoDB", "Socket.io"]),
      image: "/images/connectro.PNG",
      link: "https://drive.google.com/file/d/1xx_iI6kWtjdImBlOAkxCExxPkXQ-ojw3/view?usp=sharing",
      order: 2
    },
    {
      type: "Featured Project",
      title: "AI Cost Estimation Platform",
      subtitle: "MERN Stack, Python, Machine Learning",
      period: "Personal Project",
      details: JSON.stringify([
        "Developed an issue-reporting and contractor bidding platform with ML-based pricing estimation.",
        "Integrated Google Maps, JWT authentication, and interactive analytics dashboards."
      ]),
      tags: JSON.stringify(["MongoDB", "Express.js", "React.js", "FastAPI", "Python", "Machine Learning"]),
      image: "/images/AI_Cost_Estimation_Platform.png",
      link: "https://github.com/Surya9122prakash/potbid-fyp",
      order: 3
    }
  ];

  for (const item of timelineItems) {
    await prisma.timelineItem.create({
      data: item
    });
  }

  console.log("Seeded Timeline Items");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
