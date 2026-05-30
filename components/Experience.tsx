'use client'

import { MapPin, Calendar, ChevronRight } from 'lucide-react'

const experiences = [
  {
    role: 'NOC Network Engineer',
    company: 'Airtel',
    period: 'Sep 2025 – Present',
    location: 'Gurugram, India',
    current: true,
    bullets: [
      'Designing complex MPLS networks for enterprise B2B customers — primarily in the banking sector',
      'Optimized design workflows leading to measurable improvements in turnaround for similar network requirements',
      'Collaborating cross-functionally with planning, delivery, and support teams to ensure SLA adherence',
    ],
  },
  {
    role: 'Cloud & DevOps Projects',
    company: 'Self-Initiated',
    period: '2022 – 2025',
    location: 'Remote',
    current: false,
    bullets: [
      'Implemented and managed AWS cloud infrastructure: EC2, S3, RDS, VPC, IAM, ELB, Auto Scaling, CloudWatch, CloudTrail, SNS',
      'Configured Auto Scaling Groups with Elastic Load Balancers for dynamic traffic-based scaling and cost efficiency',
      'Designed custom VPC architectures with CIDR block planning, VPC peering, and VPN connectivity for hybrid environments',
      'Managed IAM users, groups, roles, and policies enforcing least-privilege access control',
      'Deployed Amazon RDS (MySQL) with Multi-AZ for high availability and automated backups',
      'Developed Terraform infrastructure — modules, state management, and version locking',
      'Built CI/CD pipelines with Jenkins and GitLab to automate build and deployment, reducing deployment times significantly',
      'Containerized applications with Docker for consistent cross-environment deployment',
      'Integrated security scanning: SonarQube, OWASP Dependency Check, Trivy, Anchore, OWASP ZAP',
      'Set up observability stacks with Prometheus, Grafana, ELK, and AWS CloudWatch',
    ],
  },
]

const education = [
  {
    degree: 'B.Tech — Electronics & Communication',
    institution: 'BK Birla Institute of Engineering & Technology',
    year: '2018 – 2022',
    grade: '8.6 CGPA',
  },
  {
    degree: '12th Grade',
    institution: 'Board of Secondary Education, Rajasthan',
    year: '2018',
    grade: '85.60%',
  },
  {
    degree: '10th Grade',
    institution: 'Central Board of Secondary Education',
    year: '2016',
    grade: '10 CGPA',
  },
]

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">03 / experience</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">Work History</h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-0 md:left-[23px] top-0 bottom-0 w-px bg-[var(--border)]" />
          <div className="space-y-10">
            {experiences.map((exp, i) => (
              <div key={i} className="relative pl-8 md:pl-20">
                <div className={`absolute left-[-5px] md:left-[17px] top-2 w-3 h-3 rounded-full border-2 ${
                  exp.current
                    ? 'bg-[var(--accent)] border-[var(--accent)]'
                    : 'bg-[var(--surface)] border-[var(--border)]'
                }`} />
                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:border-opacity-30 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[var(--text)] text-base">{exp.role}</h3>
                        {exp.current && (
                          <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)] border-opacity-30">
                            current
                          </span>
                        )}
                      </div>
                      <p className="text-[var(--accent)] text-sm font-semibold">{exp.company}</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-[var(--muted)] mono shrink-0">
                      <span className="flex items-center gap-1.5"><Calendar size={11} />{exp.period}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={11} />{exp.location}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                        <ChevronRight size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mt-20">
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-8">education</p>
          <div className="grid md:grid-cols-3 gap-4">
            {education.map((edu) => (
              <div key={edu.degree} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <p className="text-xs text-[var(--accent)] mono mb-2">{edu.year}</p>
                <h4 className="font-semibold text-[var(--text)] text-sm mb-1">{edu.degree}</h4>
                <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">{edu.institution}</p>
                <span className="mono text-xs px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent)] border-opacity-20 text-[var(--accent)]">
                  {edu.grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
