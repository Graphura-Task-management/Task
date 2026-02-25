import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../components/Topbar";
import Footer from "../components/common/Footer";
import { ShieldCheck, Workflow, Building2 } from "lucide-react";

const FACTS = [
  "Role-based task assignment and visibility",
  "Clear task ownership across teams",
  "Structured task lifecycle management",
  "Deadline-driven task tracking",
  "Admin, leader, and employee role separation",
  "Designed for multi-team environments",
  "Consistent workflows across projects",
  "Optimized for daily operational use",
  "Centralized task visibility for all roles",
  "Standardized task status handling",
  "Predictable task progression across stages",
  "Clear separation of responsibility and execution",
  "Task-level accountability enforcement",
  "Calendar-aligned deadline management",
  "Unified task and schedule synchronization",
  "Controlled task updates and modifications",
  "Scalable task architecture for growing teams",
  "Designed for long-term operational stability",
  "Minimal cognitive overhead for daily usage",
  "Structured task metadata management",
  "Consistent task behavior across modules",
  "Clear distinction between active and completed tasks",
  "Support for parallel project execution",
  "Reliable task state consistency",
  "Optimized for cross-functional collaboration",
  "Clear task assignment traceability",
  "Support for task review and completion validation",
  "Predictable navigation between task views",
  "Reduced ambiguity in task execution",
  "Improved visibility into workload distribution",
  "Designed for enterprise-grade workflows",
  "Task handling aligned with organizational hierarchy",
  "Structured execution without unnecessary complexity",
  "Optimized for professional work environments",
  "Reliable deadline visibility for employees",
  "Consistent user experience across task states",
  "Clear task ownership handoff mechanisms",
  "Built for disciplined execution tracking",
  "Supports operational clarity at scale",
  "Focused on execution rather than noise",
  "Designed for accountability-driven teams",
  "Stable task workflows across releases",
  "Aligned with real-world organizational processes",
  "Supports measurable task progress tracking",
];

export default function Landing() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % FACTS.length), 2800);
    return () => clearInterval(id);
  }, []);

  const visibleFacts = useMemo(() => {
    return Array.from(
      { length: 4 },
      (_, i) => FACTS[(index + i) % FACTS.length],
    );
  }, [index]);

  return (
    <div className="min-h-screen bg-white text-[#0F2F2C]">
      <Topbar />

      {/* HERO */}
      <section className="border-b border-[#E6ECEA]">
        <div className="max-w-7xl mx-auto px-6 py-14 lg:py-16 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-[#235857]">
              Task Management
              <br />
              built for structured execution
            </h1>

            <p className="mt-6 text-lg text-[#5B6B68] max-w-xl">
              Graphura enables teams to plan, assign, and execute work through
              structured workflows that create accountability and operational
              clarity.
            </p>

            <div className="mt-10 flex gap-4">
              <Link
                to="/signup"
                className="
                bg-[#235857]
                text-white
                px-7 py-3.5
                rounded-lg
                font-semibold
                transition-all duration-300
                hover:-translate-y-[2px]
                hover:shadow-lg
                hover:bg-[#1B4441]
                active:translate-y-0
                "
              >
                Create workspace
              </Link>

              <Link
                to="/login"
                className="
                border border-[#D4DFDC]
                px-7 py-3.5
                rounded-lg
                font-semibold
                transition-all duration-300
                hover:-translate-y-[2px]
                hover:shadow-md
                hover:bg-[#F6FAF9]
                "
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* RIGHT — IMPORTANT */}
          <div
            className="
            bg-white
            border border-[#E6ECEA]
            rounded-2xl
            p-7
            transition-all duration-300
            hover:shadow-xl
            hover:-translate-y-1
            "
          >
            <div className="flex justify-between mb-5">
              <h3 className="font-semibold text-[#235857]">
                Platform capabilities
              </h3>

              <span className="text-xs bg-[#EEF4F3] px-3 py-1 rounded-full">
                Live
              </span>
            </div>

            <ul className="space-y-4">
              {visibleFacts.map((fact, i) => (
                <li key={i} className="flex gap-3 text-[#4F6360]">
                  <span className="w-2 h-2 mt-2 rounded-full bg-[#235857]" />
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {/* Section Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-[#235857]">
            Built for Structured Execution
          </h2>
          <p className="text-[#5B6B68] mt-4 max-w-2xl mx-auto">
            Graphura provides the foundation for disciplined task management,
            clear accountability, and scalable operational workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Feature
            title="Role-based access"
            desc="Permissions and visibility are defined by role to ensure responsibility clarity."
          />

          <Feature
            title="Structured workflows"
            desc="Tasks move through defined stages, maintaining consistency from assignment to completion."
          />

          <Feature
            title="Operational readiness"
            desc="Built to support growing teams with disciplined execution and long-term scalability."
          />
        </div>
      </section>

      {/* ================= METRICS ================= */}
      <section className="py-16 bg-white border-y border-[#E6ECEA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <Metric number="10K+" label="Tasks Managed" />
            <Metric number="250+" label="Active Users" />
            <Metric number="40+" label="Teams Onboarded" />
            <Metric number="99.9%" label="System Reliability" />
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="bg-[#F7FAF9] py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-[#235857]">
              Trusted by Execution-Driven Teams
            </h2>
            <p className="text-[#5B6B68] mt-4 max-w-2xl mx-auto">
              Teams across domains rely on Graphura to introduce structure,
              accountability, and predictable task execution.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Testimonial
              name="Abdul Qadir Khan"
              role="Project Manager"
              text="Graphura brought operational discipline into our workflow. Clear task ownership significantly reduced coordination gaps."
            />

            <Testimonial
              name="Mukund Jha"
              role="Project Lead"
              text="Structured lifecycle stages improved delivery predictability. We now execute projects with far better visibility and alignment."
            />

            <Testimonial
              name="Rohit Malhotra"
              role="Team Director"
              text="The accountability layer built into the system allowed us to scale execution without losing process control."
            />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
 
function Feature({ title, desc }) {
  const iconMap = {
    "Role-based access": ShieldCheck,
    "Structured workflows": Workflow,
    "Operational readiness": Building2,
  };

  const Icon = iconMap[title];

  return (
    <div
      className="
      group
      relative
      bg-white
      border border-[#E6ECEA]
      rounded-2xl
      p-6
      transition-all duration-300 ease-out
      hover:-translate-y-3
      hover:shadow-2xl
      hover:border-[#235857]/30
      cursor-pointer
      "
    >
      {/* Subtle hover background */}
      <div
        className="
        absolute inset-0 rounded-2xl
        bg-gradient-to-br from-[#235857]/5 to-transparent
        opacity-0 group-hover:opacity-100
        transition duration-300
        pointer-events-none
      "
      />

      {/* Icon container */}
      {Icon && (
        <div
          className="
          w-12 h-12
          rounded-xl
          bg-[#EEF4F3]
          flex items-center justify-center
          mb-5
          transition duration-300
          group-hover:bg-[#235857]
        "
        >
          <Icon className="w-6 h-6 text-[#235857] group-hover:text-white transition duration-300" />
        </div>
      )}

      {/* Title */}
      <h4 className="font-semibold text-[#235857] mb-3 text-lg">{title}</h4>

      {/* Description */}
      <p className="text-[#5B6B68] leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function Metric({ number, label }) {
  return (
    <div
      className="
      group
      relative
      py-6
      transition-all duration-300
      hover:-translate-y-2
    "
    >
      {/* Number */}
      <h3
        className="
        text-4xl md:text-5xl
        font-bold
        text-[#235857]
        tracking-tight
        transition duration-300
        group-hover:text-[#1B4441]
      "
      >
        {number}
      </h3>

      {/* Small divider line */}
      <div
        className="
        w-10 h-[2px]
        bg-[#235857]
        mx-auto
        my-4
        opacity-40
        group-hover:w-14
        transition-all duration-300
      "
      />

      {/* Label */}
      <p
        className="
        text-[#5B6B68]
        text-sm
        uppercase
        tracking-wide
      "
      >
        {label}
      </p>
    </div>
  );
}

function Testimonial({ name, role, text }) {
  return (
    <div
      className="
      relative
      bg-white
      border border-[#E6ECEA]
      rounded-2xl
      p-7
      shadow-sm
      transition-all duration-300 ease-out
      hover:-translate-y-4
      hover:shadow-2xl
      hover:border-[#235857]/40
      hover:scale-[1.02]
      cursor-pointer
    "
    >
      {/* Subtle glow background on hover */}
      <div
        className="
        absolute inset-0 rounded-2xl
        bg-gradient-to-br from-[#235857]/5 to-transparent
        opacity-0
        hover:opacity-100
        transition duration-300
        pointer-events-none
      "
      />

      {/* Quote mark */}
      <div className="absolute top-5 right-6 text-4xl text-[#235857]/10 font-serif">
        ”
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4 relative z-10">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-[#F4B400] text-sm">
            ★
          </span>
        ))}
      </div>

      {/* Text */}
      <p className="text-[#5B6B68] text-sm leading-relaxed relative z-10">
        “{text}”
      </p>

      {/* Profile */}
      <div className="mt-6 flex items-center gap-3 relative z-10">
        <div
          className="
          w-11 h-11
          rounded-full
          bg-[#235857]
          text-white
          flex items-center
          justify-center
          text-sm
          font-semibold
          shadow-md
          transition duration-300
          hover:scale-110
        "
        >
          {name.charAt(0)}
        </div>

        <div>
          <p className="font-semibold text-[#235857] text-sm">{name}</p>
          <p className="text-xs text-[#6B7C79]">{role}</p>
        </div>
      </div>
    </div>
  );
}