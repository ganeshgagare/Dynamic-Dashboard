import axios from 'axios';
import API_BASE from '../config.js';

const API_BASE_URL = `${API_BASE}/api`;


const statuses = ['Completed', 'Pending', 'In Progress'];
const categories = ['Development', 'Design', 'Marketing', 'QA', 'DevOps', 'Analytics'];
const names = [
  'API Integration', 'UI Redesign', 'Database Migration', 'Performance Audit',
  'Security Review', 'Feature Launch', 'Bug Fix Sprint', 'Code Refactor',
  'Load Testing', 'Deployment Pipeline', 'Documentation Update', 'Mobile App',
  'Data Pipeline', 'Dashboard Setup', 'Auth Module', 'Payment Gateway',
  'Notification System', 'Search Feature', 'Admin Panel', 'Reporting Tool',
  'Cache Layer', 'Microservices', 'CI/CD Setup', 'Log Aggregation', 'A/B Testing',
  'SEO Optimization', 'Cloud Migration', 'API Gateway', 'Webhook Integration', 'SSO Setup',
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generateMockData(count = 30) {
  return Array.from({ length: count }, (_, i) => {
    const date = randomDate(new Date('2025-01-01'), new Date('2026-04-15'));
    return {
      id: i + 1,
      name: names[i % names.length],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: date.toISOString().split('T')[0],
      category: categories[Math.floor(Math.random() * categories.length)],
      value: Math.floor(Math.random() * 900) + 100,
    };
  });
}

export async function fetchDashboardData() {
  try {
    const res = await axios.get(`${API_BASE_URL}/dashboard-data`, { timeout: 3000 });
    return res.data;
  } catch {
    // Fallback to mock data when backend is not running
    return generateMockData(30);
  }
}
