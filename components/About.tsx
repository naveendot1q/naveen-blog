'use client'

import Image from 'next/image'
import { MapPin, Briefcase, GraduationCap, ExternalLink } from 'lucide-react'

const stats = [
  { label: 'Years Experience', value: '3+' },
  { label: 'Cloud Platforms', value: '3' },
  { label: 'AWS Services', value: '10+' },
  { label: 'CI/CD Pipelines', value: '∞' },
]

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">
            01 / about
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">
            Who I am
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Photo + stats */}
          <div>
            <div className="relative mb-8">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-transparent opacity-20" />
              <Image
                src="/avatar.png"
                alt="Naveen Meel"
                width={320}
                height={320}
                className="relative rounded-2xl w-full max-w-[280px] object-cover border border-[var(--border)]"
              />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <p className="text-2xl font-bold text-[var(--accent)] mono">{stat.value}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Bio */}
          <div className="space-y-6">
            <p className="text-[var(--text)] leading-relaxed opacity-90">
              I&apos;m a Network and Cloud Engineer currently working at{' '}
              <span className="text-[var(--accent)] font-medium">Airtel</span>, where I design
              complex MPLS networks for enterprise B2B customers — primarily in the banking sector.
            </p>

            <p className="text-[var(--text)] leading-relaxed opacity-80">
              My background bridges traditional networking with modern cloud infrastructure.
              I&apos;ve hands-on built and managed AWS environments — VPCs, EC2, RDS, IAM, S3,
              Auto Scaling, and observability stacks — while also working across Azure and GCP.
            </p>

            <p className="text-[var(--text)] leading-relaxed opacity-80">
              Beyond networking, I&apos;m deeply into DevOps tooling: I&apos;ve built CI/CD
              pipelines with Jenkins and GitLab, containerized workloads with Docker and
              Kubernetes, and written infrastructure as code with Terraform and Ansible.
            </p>

            {/* Meta info */}
            <div className="pt-4 space-y-3">
              {[
                { Icon: MapPin, text: 'Gurugram, India (Rajasthan roots)' },
                { Icon: Briefcase, text: 'NOC Network Engineer @ Airtel' },
                { Icon: GraduationCap, text: 'B.Tech ECE — BK Birla Institute (8.6 CGPA)' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-[var(--muted)]">
                  <Icon size={14} className="text-[var(--accent)] shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <a
              href="https://linkedin.com/in/naveenmeel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mono text-xs text-[var(--accent)] hover:opacity-80 transition-opacity border border-[var(--accent)] border-opacity-30 px-4 py-2 rounded-lg hover:bg-[var(--accent)] hover:bg-opacity-5 mt-2"
            >
              <ExternalLink size={13} />
              view linkedin profile
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
