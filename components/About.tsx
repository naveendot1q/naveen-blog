'use client'

import { MapPin, Briefcase, GraduationCap, ExternalLink } from 'lucide-react'

const stats = [
  { label: 'Years Experience', value: '3+' },
  { label: 'Cloud Platforms', value: '3' },
  { label: 'AWS Services', value: '10+' },
  { label: 'CI/CD Pipelines Built', value: '∞' },
]

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">01 / about</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">Who I am</h2>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map((stat) => (
            <div key={stat.label} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center">
              <p className="text-3xl font-bold text-[var(--accent)] mb-1">{stat.value}</p>
              <p className="text-xs text-[var(--muted)]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-5">
            <p className="text-[var(--text)] leading-relaxed">
              I&apos;m a Network and Cloud Engineer currently working at{' '}
              <span className="text-[var(--accent)] font-semibold">Airtel</span>, designing
              complex MPLS networks for enterprise B2B customers — primarily in the banking sector.
            </p>
            <p className="text-[var(--text)] leading-relaxed opacity-85">
              My background bridges traditional networking with modern cloud infrastructure.
              I&apos;ve built and managed AWS environments end-to-end — VPCs, EC2, RDS, IAM, 
              Auto Scaling, Load Balancers, CloudWatch — while also working across Azure and GCP.
            </p>
            <p className="text-[var(--text)] leading-relaxed opacity-85">
              On the DevOps side, I&apos;ve built CI/CD pipelines with Jenkins and GitLab, containerized 
              workloads with Docker and Kubernetes, and written infrastructure as code using Terraform and Ansible.
            </p>

            <div className="pt-2 space-y-3">
              {[
                { Icon: MapPin, text: 'Gurugram, India (from Rajasthan)' },
                { Icon: Briefcase, text: 'NOC Network Engineer @ Airtel' },
                { Icon: GraduationCap, text: 'B.Tech ECE — BK Birla Institute, 8.6 CGPA' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-[var(--muted)]">
                  <Icon size={14} className="text-[var(--accent)] shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <a href="https://linkedin.com/in/naveenmeel" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
              <ExternalLink size={14} />
              linkedin.com/in/naveenmeel
            </a>
          </div>

          <div className="space-y-5">
            <h3 className="font-semibold text-[var(--text)] text-lg">Currently focused on</h3>
            <div className="space-y-3">
              {[
                { title: 'MPLS Network Design', desc: 'Building and optimizing complex enterprise MPLS topologies for Airtel B2B banking clients' },
                { title: 'AWS Cloud Infrastructure', desc: 'Architecting scalable, secure AWS environments with IaC, monitoring, and cost optimization' },
                { title: 'CI/CD & DevOps Automation', desc: 'Streamlining deployments with Jenkins, GitLab CI, Docker, Kubernetes, and security scanning' },
                { title: 'Terraform & Ansible', desc: 'Infrastructure as Code for repeatable, auditable cloud provisioning' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                    <p className="font-semibold text-sm text-[var(--text)]">{item.title}</p>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed pl-3.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
