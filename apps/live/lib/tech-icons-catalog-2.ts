import type { TechIconDef } from './tech-icons';

// Technology icon catalogue, part 2 of 2 (spec/41). See
// tech-icons-catalog-1.ts for the split rationale.
export const TECH_ICON_CATALOG_PART_2: TechIconDef[] = [
  {
    id: 'rabbitmq',
    label: 'RabbitMQ',
    provider: 'generic',
    keywords: 'message queue broker amqp',
    color: '#FF6600',
    glyph:
      '<path d="M9 6.5v4M11.5 6.5v4"/><path d="M8 10.5h8v6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" fill="#fff" stroke="none"/><rect x="12.5" y="12.5" width="2.5" height="2.5" rx=".3" fill="#FF6600" stroke="none"/>',
  },
  {
    id: 'elasticsearch',
    label: 'Elasticsearch',
    short: 'Elastic',
    provider: 'generic',
    keywords: 'search index lucene elk log',
    color: '#00BFB3',
    glyph: '<path d="M6.5 8.5h11M6.5 12h8.5M6.5 15.5h6" stroke-width="1.8"/>',
  },
  {
    id: 'graphql',
    label: 'GraphQL',
    provider: 'generic',
    keywords: 'api query schema',
    color: '#E10098',
    glyph:
      '<path d="M12 5.5 17.6 8.7v6.6L12 18.5 6.4 15.3V8.7Z"/><g fill="#fff" stroke="none"><circle cx="12" cy="5.5" r="1.3"/><circle cx="17.6" cy="8.7" r="1.3"/><circle cx="17.6" cy="15.3" r="1.3"/><circle cx="12" cy="18.5" r="1.3"/><circle cx="6.4" cy="15.3" r="1.3"/><circle cx="6.4" cy="8.7" r="1.3"/></g>',
  },
  {
    id: 'github',
    label: 'GitHub',
    provider: 'generic',
    keywords: 'git repository version control source code',
    color: '#181717',
    glyph:
      '<circle cx="7" cy="6" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="16" cy="8" r="2"/><path d="M7 8v8M16 10v1.5a3 3 0 0 1-3 3H7"/>',
  },
  {
    id: 'gitlab',
    label: 'GitLab',
    provider: 'generic',
    keywords: 'git repository version control devops ci',
    color: '#FC6D26',
    glyph: '<path d="M12 20 4.5 10.5 6 5l2.4 5.5h7.2L18 5l1.5 5.5Z" fill="#fff" stroke="none"/>',
  },
  {
    id: 'nodejs',
    label: 'Node.js',
    provider: 'generic',
    keywords: 'javascript runtime server backend npm',
    color: '#5FA04E',
    glyph: '<path d="M12 3.5 19 7.5v9L12 20.5 5 16.5v-9Z"/><path d="M9.5 15.5v-6l5 4.5v-6"/>',
  },
  {
    id: 'react',
    label: 'React',
    provider: 'generic',
    keywords: 'javascript ui frontend component library',
    color: '#087EA4',
    glyph:
      '<circle cx="12" cy="12" r="1.6" fill="#fff" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)"/>',
  },
  {
    id: 'vercel',
    label: 'Vercel',
    provider: 'generic',
    keywords: 'hosting deploy edge frontend serverless',
    color: '#000000',
    glyph: '<path d="M12 4 21 20H3Z" fill="#fff" stroke="none"/>',
  },
  {
    id: 'supabase',
    label: 'Supabase',
    provider: 'generic',
    keywords: 'database postgres backend auth realtime',
    color: '#3FCF8E',
    glyph: '<path d="M13 3 5.5 13.2H11l-.8 7.8 8.3-11H13Z" fill="#fff" stroke="none"/>',
  },
  {
    id: 'terraform',
    label: 'Terraform',
    provider: 'generic',
    keywords: 'infrastructure as code iac hashicorp provisioning',
    color: '#7B42BC',
    glyph:
      '<path d="M10 5.5 14 7.8v4.5L10 10Z"/><path d="M14.7 8.2 18.7 10.5v4.5l-4-2.3Z"/><path d="M10 10.8 14 13.1v4.5L10 15.3Z"/>',
  },
  {
    id: 'cassandra',
    label: 'Cassandra',
    provider: 'generic',
    keywords: 'database distributed nosql wide column apache',
    color: '#1287B1',
    glyph:
      '<ellipse cx="12" cy="12" rx="8.5" ry="5"/><circle cx="12" cy="12" r="2" fill="#fff" stroke="none"/>',
  },
  {
    id: 'prometheus',
    label: 'Prometheus',
    provider: 'generic',
    keywords: 'monitoring metrics observability alerting time series',
    color: '#E6522C',
    glyph:
      '<path d="M12 3.5c2.2 2.6 1 4.4 0 5.4 1.6.2 2.8 1.6 2.8 3.2a3.6 3.6 0 0 1-7.2 0c0-1 .4-1.9 1-2.6"/><path d="M7.5 16.5h9M8.5 19h7"/>',
  },
  // ---- Cloudflare ---------------------------------------------------------
  {
    id: 'cf-workers',
    label: 'Workers',
    provider: 'cloudflare',
    keywords: 'cloudflare serverless function compute edge',
    color: '#F38020',
    glyph:
      '<circle cx="12" cy="12" r="3"/><path d="M12 6.2V8M12 16v1.8M6.2 12H8M16 12h1.8M8 8l1.3 1.3M16 16l-1.3-1.3M8 16l1.3-1.3M16 8l-1.3 1.3"/>',
  },
  {
    id: 'cf-pages',
    label: 'Pages',
    provider: 'cloudflare',
    keywords: 'cloudflare static site hosting jamstack',
    color: '#F38020',
    glyph:
      '<rect x="7.5" y="6" width="9" height="12" rx="1"/><path d="M9.5 9.5h5M9.5 12h5M9.5 14.5h3"/>',
  },
  {
    id: 'cf-r2',
    label: 'R2',
    provider: 'cloudflare',
    keywords: 'cloudflare object storage bucket s3',
    color: '#F38020',
    glyph:
      '<path d="M6.5 8h11l-1 9.2a1.3 1.3 0 0 1-1.3 1.15H8.8A1.3 1.3 0 0 1 7.5 17.2Z"/><path d="M6 8h12"/>',
  },
  {
    id: 'cf-d1',
    label: 'D1',
    provider: 'cloudflare',
    keywords: 'cloudflare database sql sqlite',
    color: '#F38020',
    glyph: '<ellipse cx="12" cy="8" rx="5" ry="2"/><path d="M7 8v8c0 1.1 2.2 2 5 2s5-.9 5-2V8"/>',
  },
  {
    id: 'cf-kv',
    label: 'KV',
    provider: 'cloudflare',
    keywords: 'cloudflare key value store',
    color: '#F38020',
    glyph: '<circle cx="9" cy="12" r="2.5"/><path d="M11.4 12H18M15.5 12v2.5M18 12v2.5"/>',
  },
  {
    id: 'cf-durable-objects',
    label: 'Durable Objects',
    short: 'Durable Obj',
    provider: 'cloudflare',
    keywords: 'cloudflare stateful coordination actor',
    color: '#F38020',
    glyph: '<rect x="7.5" y="7.5" width="9" height="9" rx="1"/><circle cx="12" cy="12" r="2"/>',
  },
  {
    id: 'cf-queues',
    label: 'Queues',
    provider: 'cloudflare',
    keywords: 'cloudflare message queue async',
    color: '#F38020',
    glyph:
      '<rect x="6" y="8.5" width="3" height="7" rx="0.6"/><rect x="10.5" y="8.5" width="3" height="7" rx="0.6"/><rect x="15" y="8.5" width="3" height="7" rx="0.6"/>',
  },
  {
    id: 'cf-zero-trust',
    label: 'Zero Trust',
    provider: 'cloudflare',
    keywords: 'cloudflare access security shield warp',
    color: '#F38020',
    glyph:
      '<path d="M12 5.5l5 2v4c0 3.2-2.2 5.6-5 6.5-2.8-.9-5-3.3-5-6.5v-4z"/><path d="M10 12l1.5 1.5L14.5 10.5"/>',
  },
  {
    id: 'cf-cdn',
    label: 'CDN',
    provider: 'cloudflare',
    keywords: 'cloudflare cache edge network delivery',
    color: '#F38020',
    glyph:
      '<circle cx="12" cy="12" r="2"/><circle cx="6.5" cy="8.5" r="1.4"/><circle cx="17.5" cy="8.5" r="1.4"/><circle cx="6.5" cy="15.5" r="1.4"/><circle cx="17.5" cy="15.5" r="1.4"/><path d="M10.3 10.8 7.7 9.4M13.7 10.8l2.6-1.4M10.3 13.2l-2.6 1.4M13.7 13.2l2.6 1.4"/>',
  },
  {
    id: 'cf-dns',
    label: 'DNS',
    provider: 'cloudflare',
    keywords: 'cloudflare domain name resolver records',
    color: '#F38020',
    glyph:
      '<circle cx="12" cy="12" r="5.5"/><ellipse cx="12" cy="12" rx="2.4" ry="5.5"/><path d="M6.6 12h10.8"/>',
  },
  {
    id: 'cf-waf',
    label: 'WAF',
    provider: 'cloudflare',
    keywords: 'cloudflare firewall security web application rules',
    color: '#F38020',
    glyph:
      '<rect x="6.5" y="7.5" width="11" height="9" rx="0.8"/><path d="M6.5 12h11M11 7.5v4.5M14 12v4.5M8 12v4.5"/>',
  },
  {
    id: 'cf-workers-ai',
    label: 'Workers AI',
    provider: 'cloudflare',
    keywords: 'cloudflare ai inference machine learning model',
    color: '#F38020',
    glyph:
      '<rect x="8" y="8" width="8" height="8" rx="1.5"/><path d="M10.5 8V5.7M13.5 8V5.7M10.5 16v2.3M13.5 16v2.3M8 10.5H5.7M8 13.5H5.7M16 10.5h2.3M16 13.5h2.3"/><circle cx="12" cy="12" r="1.7" fill="#fff" stroke="none"/>',
  },
  {
    id: 'cf-images',
    label: 'Images',
    provider: 'cloudflare',
    keywords: 'cloudflare image resize optimise media',
    color: '#F38020',
    glyph:
      '<rect x="6.5" y="7" width="11" height="10" rx="1.5"/><circle cx="9.5" cy="10.5" r="1"/><path d="M7 16l3.5-3.5 2.5 2.5 2-1.8 2 2"/>',
  },
  {
    id: 'cf-stream',
    label: 'Stream',
    provider: 'cloudflare',
    keywords: 'cloudflare video streaming player media',
    color: '#F38020',
    glyph:
      '<circle cx="12" cy="12" r="6"/><path d="M10.5 9.5l4 2.5-4 2.5z" fill="#fff" stroke="none"/>',
  },
  // ---- Firebase -----------------------------------------------------------
  {
    id: 'fb-firestore',
    label: 'Firestore',
    provider: 'firebase',
    keywords: 'firebase google document database nosql collection',
    color: '#F57C00',
    glyph:
      '<rect x="7.5" y="6" width="9" height="5" rx="1"/><rect x="7.5" y="13" width="9" height="5" rx="1"/><path d="M9.5 8.5h5M9.5 15.5h5"/>',
  },
  {
    id: 'fb-realtime-db',
    label: 'Realtime Database',
    short: 'Realtime DB',
    provider: 'firebase',
    keywords: 'firebase google realtime database json sync',
    color: '#F57C00',
    glyph:
      '<ellipse cx="12" cy="8" rx="5" ry="2"/><path d="M7 8v8c0 1.1 2.2 2 5 2s5-.9 5-2V8"/><path d="M12.6 10.5l-2 3h1.6l-.6 2.4 2.4-3.2h-1.6l.6-2.2z" fill="#fff" stroke="none"/>',
  },
  {
    id: 'fb-auth',
    label: 'Authentication',
    short: 'Auth',
    provider: 'firebase',
    keywords: 'firebase google login identity sign in users',
    color: '#F57C00',
    glyph:
      '<rect x="8" y="11" width="8" height="6" rx="1"/><path d="M9.5 11V9a2.5 2.5 0 0 1 5 0v2"/>',
  },
  {
    id: 'fb-functions',
    label: 'Cloud Functions',
    short: 'Functions',
    provider: 'firebase',
    keywords: 'firebase google serverless function compute',
    color: '#F57C00',
    glyph:
      '<path d="M10.5 7c-2 0-2 2-2 3s0 2-1.5 2c1.5 0 1.5 1 1.5 2s0 3 2 3M13.5 7c2 0 2 2 2 3s0 2 1.5 2c-1.5 0-1.5 1-1.5 2s0 3-2 3"/>',
  },
  {
    id: 'fb-hosting',
    label: 'Hosting',
    provider: 'firebase',
    keywords: 'firebase google static hosting deploy cdn',
    color: '#F57C00',
    glyph:
      '<path d="M7 15.5h9.5a2.5 2.5 0 0 0 .3-5 4 4 0 0 0-7.5-1.2A3 3 0 0 0 7 15.5Z"/><path d="M12 17v-4.5M10.3 14.2 12 12.5l1.7 1.7"/>',
  },
  {
    id: 'fb-storage',
    label: 'Cloud Storage',
    short: 'Storage',
    provider: 'firebase',
    keywords: 'firebase google file object storage bucket',
    color: '#F57C00',
    glyph:
      '<path d="M6.5 8h11l-1 9.2a1.3 1.3 0 0 1-1.3 1.15H8.8A1.3 1.3 0 0 1 7.5 17.2Z"/><path d="M6 8h12"/>',
  },
  {
    id: 'fb-messaging',
    label: 'Cloud Messaging',
    short: 'Messaging',
    provider: 'firebase',
    keywords: 'firebase google fcm push notification',
    color: '#F57C00',
    glyph:
      '<path d="M9 14.5V11a3 3 0 0 1 6 0v3.5l1 1.5H8z"/><path d="M11 16.5a1.2 1.2 0 0 0 2 0"/>',
  },
];
