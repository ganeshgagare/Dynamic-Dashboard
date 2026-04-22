export function HelpPage() {
  const faqs = [
    ['How do I filter tasks?', 'Use the Filter bar on the Dashboard or Tasks page. You can filter by status, category, or search by name. Quick-filter chips are also available for instant status filtering.'],
    ['How does auto-refresh work?', 'Click the "Auto-Refresh" button in the top bar to enable automatic data refresh every 30 seconds. The live dot indicator will pulse green when active.'],
    ['Can I export data?', 'Yes! Go to the Reports page and click "Export CSV" to download all task data as a CSV file that opens in Excel or Google Sheets.'],
    ['What roles are available?', 'DataPulse supports 4 roles: Admin (full access), Manager (manage tasks), Analyst (view analytics), and Viewer (read-only).'],
    ['How do I change my password?', 'Navigate to Settings → Security section. Enter your current password and then your new password twice to update it.'],
    ['Is data real-time?', 'The dashboard auto-refreshes from the API every 30 seconds when enabled, or you can click the manual Refresh button anytime.'],
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">❓ Help & Support</h2>
        <p className="page-sub">Find answers and get in touch with our team</p>
      </div>

      <div className="help-grid">
        <div>
          <h3 className="settings-section" style={{ marginBottom: 16 }}>📚 Frequently Asked Questions</h3>
          <div className="faq-list">
            {faqs.map(([q, a], i) => (
              <details key={i} className="faq-item">
                <summary className="faq-q">{q}</summary>
                <p className="faq-a">{a}</p>
              </details>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="help-contact-card">
            <div className="help-contact-icon">📧</div>
            <h4>Email Support</h4>
            <p>Reach out directly to the developer for support, bugs, or feature requests.</p>
            <a href="mailto:ganesh.gagare.19@gmail.com" className="help-email-link">
              ganesh.gagare.19@gmail.com
            </a>
          </div>

          <div className="help-contact-card">
            <div className="help-contact-icon">📖</div>
            <h4>Documentation</h4>
            <p>Full-stack project built with React, Spring Boot, and PostgreSQL. View the README for setup instructions.</p>
            <div className="help-tech-tags">
              {['React','Vite','Recharts','Spring Boot','PostgreSQL'].map(t => (
                <span key={t} className="help-tag">{t}</span>
              ))}
            </div>
          </div>

          <div className="help-contact-card">
            <div className="help-contact-icon">🚀</div>
            <h4>App Version</h4>
            <p style={{ marginBottom: 8 }}>DataPulse Dynamic Dashboard</p>
            <div className="help-version-row"><span>Version</span><span>1.0.0</span></div>
            <div className="help-version-row"><span>Built with</span><span>React 18 + Vite</span></div>
            <div className="help-version-row"><span>Developer</span><span>Ganesh Gagare</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
