import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TaskOwner } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// 30-step MAP template parsed from MAP_Template.csv
const TEMPLATE_PHASES = [
  {
    name: "Discovery & Scoping",
    displayOrder: 0,
    tasks: [
      {
        step: 1,
        title: "Discovery / Scoping Call",
        owner: "JOINT" as TaskOwner,
        providerContact: "[AE] + [Client Champion]",
        estimatedDays: 1,
        successCriteria:
          "Meeting held; pain points documented; scope and goals understood by both parties. Identify key stakeholders, decision-making process, and internal timeline on client side.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 2,
        title: "Internal debrief & requirements summary",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE] + [Solutions/Ops Team]",
        estimatedDays: 1,
        successCriteria:
          "Internal alignment complete; scoping notes summarized; any open questions flagged for follow-up with client.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "Proposal Development",
    displayOrder: 1,
    tasks: [
      {
        step: 3,
        title: "Build proposal with internal Ops team",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE] + [Ops Team]",
        estimatedDays: 5,
        successCriteria:
          "Proposal drafted covering scope, approach, pricing, and proposed timeline.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 4,
        title: "Internal proposal review & sign-off",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE] + [Manager]",
        estimatedDays: 1,
        successCriteria:
          "Proposal reviewed and approved internally. Pricing confirmed. Ready for client delivery.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "Proposal Presentation",
    displayOrder: 2,
    tasks: [
      {
        step: 5,
        title: "Present proposal to client (with internal Ops team)",
        owner: "JOINT" as TaskOwner,
        providerContact: "[AE] + [Ops] + [Client Champion] + [Stakeholders]",
        estimatedDays: 1,
        successCriteria:
          "Proposal presented in full. Client questions addressed. Both parties agree on next steps.",
        isClientVisible: true,
        isForecastMilestone: true,
        forecastProbability: 25,
        isTbdWithClient: false,
      },
      {
        step: 6,
        title: "Follow-up: address outstanding questions & objections",
        owner: "JOINT" as TaskOwner,
        providerContact: "[AE] + [Client Champion]",
        estimatedDays: 3,
        successCriteria:
          "All follow-up questions resolved. Client has full understanding of proposed scope and value.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "Client Internal Review",
    displayOrder: 3,
    tasks: [
      {
        step: 7,
        title: "[TBD WITH CLIENT] Client shares proposal internally",
        owner: "CLIENT" as TaskOwner,
        providerContact: "[Client Champion]",
        estimatedDays: null,
        successCriteria:
          "MAP WITH CLIENT: Who are the internal stakeholders that need to review? What is the internal sign-off process? What is a realistic timeline? Any known objections?",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: true,
      },
      {
        step: 8,
        title: "[TBD WITH CLIENT] Client internal stakeholder review & alignment",
        owner: "CLIENT" as TaskOwner,
        providerContact: "[Client Champion] + [Decision Makers]",
        estimatedDays: null,
        successCriteria:
          "All key internal stakeholders have reviewed the proposal. Champion has internal alignment to move forward.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: true,
      },
      {
        step: 9,
        title: "Provider check-in / status update call",
        owner: "JOINT" as TaskOwner,
        providerContact: "[AE] + [Client Champion]",
        estimatedDays: 1,
        successCriteria:
          "Status confirmed. Any blockers or concerns surfaced and addressed. Next steps agreed upon.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "Client Decision",
    displayOrder: 4,
    tasks: [
      {
        step: 10,
        title: "[TBD WITH CLIENT] Client provides verbal approval to proceed with formal SOW",
        owner: "CLIENT" as TaskOwner,
        providerContact: "[Client Champion] + [Economic Buyer]",
        estimatedDays: null,
        successCriteria:
          "Verbal confirmation received that client wants to proceed to SOW. MAP WITH CLIENT: Who is the decision-maker? What does formal approval look like?",
        isClientVisible: true,
        isForecastMilestone: true,
        forecastProbability: 50,
        isTbdWithClient: true,
      },
    ],
  },
  {
    name: "SOW Development",
    displayOrder: 5,
    tasks: [
      {
        step: 11,
        title: "Build Statement of Work (SOW)",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE] + [Ops] + [Legal]",
        estimatedDays: 5,
        successCriteria:
          "SOW drafted with full scope, deliverables, acceptance criteria, timelines, payment terms, and pricing.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 12,
        title: "Build internal capacity & resource plan",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[Ops] + [Resource Manager]",
        estimatedDays: 3,
        successCriteria:
          "Resource plan completed. Delivery team tentatively identified. Capacity confirmed for proposed start date.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 13,
        title: "Internal SOW review & approval",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE] + [Manager] + [Legal]",
        estimatedDays: 2,
        successCriteria:
          "SOW reviewed and approved internally. All commercial and legal terms signed off. Ready for client delivery.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "SOW Review",
    displayOrder: 6,
    tasks: [
      {
        step: 14,
        title: "Share SOW to client",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE]",
        estimatedDays: 1,
        successCriteria:
          "SOW delivered to client. Receipt confirmed. Client understands review timeline expectation.",
        isClientVisible: true,
        isForecastMilestone: true,
        forecastProbability: 65,
        isTbdWithClient: false,
      },
      {
        step: 15,
        title: "[TBD WITH CLIENT] Client SOW review",
        owner: "CLIENT" as TaskOwner,
        providerContact: "[Client Champion] + [Legal] + [Decision Makers]",
        estimatedDays: null,
        successCriteria:
          "MAP WITH CLIENT: Who will review the SOW? Is procurement involved? What is a realistic review timeline?",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: true,
      },
      {
        step: 16,
        title: "Client SOW feedback / requested changes",
        owner: "CLIENT" as TaskOwner,
        providerContact: "[Client Champion]",
        estimatedDays: null,
        successCriteria:
          "Client feedback received in writing. All requested changes are documented and prioritized.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: true,
      },
      {
        step: 17,
        title: "Provider reviews & responds to client feedback",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE] + [Ops] + [Legal]",
        estimatedDays: 2,
        successCriteria:
          "Provider response to each item of feedback delivered. Open items logged with proposed resolutions.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 18,
        title: "SOW revision (if applicable)",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[Ops] + [Legal]",
        estimatedDays: 2,
        successCriteria:
          "Revised SOW version produced incorporating agreed-upon changes. Version-controlled and logged.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "Contract Negotiations",
    displayOrder: 7,
    tasks: [
      {
        step: 19,
        title: "Legal review initiated — Client",
        owner: "CLIENT" as TaskOwner,
        providerContact: "[Client Legal]",
        estimatedDays: null,
        successCriteria:
          "Client legal team engaged and reviewing final document. Point of contact confirmed.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: true,
      },
      {
        step: 20,
        title: "Legal review initiated — Provider",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[Provider Legal]",
        estimatedDays: 2,
        successCriteria: "Provider legal team engaged. Internal review underway.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 21,
        title: "Contract redlines exchanged",
        owner: "JOINT" as TaskOwner,
        providerContact: "[Both Legal Teams]",
        estimatedDays: 3,
        successCriteria:
          "All redlines and markup received from both parties. Negotiation underway.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 22,
        title: "Final SOW & contract terms aligned",
        owner: "JOINT" as TaskOwner,
        providerContact: "[AE] + [Client Champion] + [Both Legal Teams]",
        estimatedDays: 2,
        successCriteria:
          "All contract terms agreed upon. No outstanding redlines. Both parties confirm readiness to execute.",
        isClientVisible: true,
        isForecastMilestone: true,
        forecastProbability: 80,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "Contract Execution",
    displayOrder: 8,
    tasks: [
      {
        step: 23,
        title: "Final contract issued for signature",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE] + [Legal]",
        estimatedDays: 1,
        successCriteria:
          "Final executed version of contract sent to authorized signatory at client. Docusign (or equivalent) initiated.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 24,
        title: "CONTRACT SIGNED — CLOSED WON",
        owner: "JOINT" as TaskOwner,
        providerContact: "[Both Authorized Signatories]",
        estimatedDays: 1,
        successCriteria:
          "Fully executed agreement received. Deal marked Closed Won in CRM. Revenue recognition triggered. Ops team notified.",
        isClientVisible: true,
        isForecastMilestone: true,
        forecastProbability: 100,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "Internal Preparation",
    displayOrder: 9,
    tasks: [
      {
        step: 25,
        title: "Internal staffing alignment",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[Resource Manager] + [Ops]",
        estimatedDays: 2,
        successCriteria:
          "Delivery team formally assigned to account. Roles and responsibilities confirmed.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 26,
        title: "Internal capacity & scheduling confirmation",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[Ops] + [Delivery Team]",
        estimatedDays: 2,
        successCriteria:
          "Team availability confirmed. Project schedule drafted. Start date locked.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 27,
        title: "Internal handoff call",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[AE] + [Ops] + [Delivery Team]",
        estimatedDays: 1,
        successCriteria:
          "Sales-to-delivery handoff complete. All context, client background, commitments, and sensitivities transferred to delivery team.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
      {
        step: 28,
        title: "Project setup (systems / tools / access provisioning)",
        owner: "PROVIDER" as TaskOwner,
        providerContact: "[Ops] + [Delivery Team]",
        estimatedDays: 2,
        successCriteria:
          "All internal systems configured. Project workspace ready. Any client-facing tools or access requests initiated.",
        isClientVisible: false,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
    ],
  },
  {
    name: "Client Onboarding",
    displayOrder: 10,
    tasks: [
      {
        step: 29,
        title: "Kickoff call with client",
        owner: "JOINT" as TaskOwner,
        providerContact: "[Delivery Lead] + [Client Champion] + [Stakeholders]",
        estimatedDays: 1,
        successCriteria:
          "Kickoff complete. Roles, responsibilities, communication cadence, and project schedule confirmed with client.",
        isClientVisible: true,
        isForecastMilestone: true,
        forecastProbability: 100,
        isTbdWithClient: false,
      },
      {
        step: 30,
        title: "Onboarding begins",
        owner: "JOINT" as TaskOwner,
        providerContact: "[Delivery Team] + [Client Team]",
        estimatedDays: null,
        successCriteria:
          "Onboarding tasks initiated. Client team actively engaged. Success metrics and check-in cadence established.",
        isClientVisible: true,
        isForecastMilestone: false,
        forecastProbability: null,
        isTbdWithClient: false,
      },
    ],
  },
];

async function main() {
  console.log("Starting seed...");

  // Check if a seed org already exists
  const existingOrg = await prisma.organization.findFirst({
    where: { slug: "seed-org" },
  });

  let orgId: string;
  let userId: string;

  if (!existingOrg) {
    console.log("Creating seed organization and placeholder admin user...");
    const org = await prisma.organization.create({
      data: {
        name: "Demo Organization",
        slug: "seed-org",
        users: {
          create: {
            clerkId: "seed_placeholder",
            name: "Admin User",
            email: "admin@example.com",
            role: "ADMIN",
          },
        },
      },
      include: { users: true },
    });
    orgId = org.id;
    userId = org.users[0].id;
    console.log(`Created org: ${org.name} (${org.slug})`);
    console.log(`Created placeholder admin. Sign up via Clerk + onboarding for a real account.`);
  } else {
    orgId = existingOrg.id;
    const user = await prisma.user.findFirst({ where: { organizationId: orgId } });
    userId = user!.id;
    console.log("Seed org already exists, skipping org/user creation.");
  }

  // Check if default template already exists
  const existingTemplate = await prisma.mapTemplate.findFirst({
    where: { organizationId: orgId, isDefault: true },
  });

  if (existingTemplate) {
    console.log("Default template already seeded, skipping.");
    return;
  }

  console.log("Creating default 30-step MAP template...");

  await prisma.mapTemplate.create({
    data: {
      organizationId: orgId,
      name: "Standard Sales Process (30-Step)",
      description:
        "A comprehensive 30-step sales process MAP covering Discovery through Client Onboarding.",
      isDefault: true,
      createdById: userId,
      phases: {
        create: TEMPLATE_PHASES.map((phase) => ({
          name: phase.name,
          displayOrder: phase.displayOrder,
          tasks: {
            create: phase.tasks.map((task, taskIdx) => ({
              title: task.title,
              owner: task.owner,
              providerContact: task.providerContact,
              estimatedDays: task.estimatedDays,
              successCriteria: task.successCriteria,
              isClientVisible: task.isClientVisible,
              isForecastMilestone: task.isForecastMilestone,
              forecastProbability: task.forecastProbability,
              isTbdWithClient: task.isTbdWithClient,
              displayOrder: taskIdx,
            })),
          },
        })),
      },
    },
  });

  console.log("Default template seeded successfully.");
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
