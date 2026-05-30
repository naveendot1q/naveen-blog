'use client'

const skillGroups = [
  {
    label: 'Cloud Platforms',
    prefix: 'cloud',
    items: ['AWS (EC2, S3, RDS, VPC, IAM, ELB, Auto Scaling, CloudWatch, CloudTrail, SNS)', 'Microsoft Azure', 'Google Cloud Platform (GCP)'],
  },
  {
    label: 'Networking',
    prefix: 'net',
    items: ['MPLS Network Design', 'VPC Architecture & CIDR Planning', 'VPC Peering & VPN Connectivity', 'Enterprise B2B Networking', 'Routing & Switching'],
  },
  {
    label: 'CI/CD & DevOps',
    prefix: 'devops',
    items: ['Jenkins', 'Azure DevOps', 'GitLab CI/CD', 'GitHub Actions', 'Maven', 'NodeJS (basics)'],
  },
  {
    label: 'Infrastructure as Code',
    prefix: 'iac',
    items: ['Terraform (modules, state management, version locking)', 'Ansible', 'Shell Scripting', 'Python (scripting)'],
  },
  {
    label: 'Containers & Orchestration',
    prefix: 'container',
    items: ['Docker', 'Kubernetes', 'Nexus3 / Azure Artifacts'],
  },
  {
    label: 'Security & Quality',
    prefix: 'sec',
    items: ['SonarQube', 'OWASP Dependency Check', 'Trivy', 'Anchore', 'OWASP ZAP', 'IAM fine-grained policies'],
  },
  {
    label: 'Monitoring & Observability',
    prefix: 'obs',
    items: ['Prometheus', 'Grafana', 'ELK Stack', 'AWS CloudWatch'],
  },
  {
    label: 'Version Control & Tools',
    prefix: 'vcs',
    items: ['Git / GitHub', 'Azure Repos', 'JIRA'],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">02 / skills</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">Technical Stack</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillGroups.map((group) => (
            <div key={group.prefix}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] hover:border-opacity-40 transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <p className="mono text-[10px] tracking-widest text-[var(--muted)] uppercase">{group.prefix}</p>
              </div>
              <h3 className="font-semibold text-[var(--text)] text-sm mb-3">{group.label}</h3>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                    <span className="text-[var(--accent)] mt-0.5 shrink-0">›</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
          <p className="mono text-[10px] text-[var(--muted)] tracking-widest uppercase mb-3">operating systems</p>
          <div className="flex flex-wrap gap-2">
            {['Linux (Ubuntu, CentOS)', 'Windows Server', 'Windows 10/11'].map(os => (
              <span key={os}
                className="mono text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-default">
                {os}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
