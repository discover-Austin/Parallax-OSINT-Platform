/**
 * Parallax Intelligence Platform - Comprehensive Dork Template Library
 *
 * 100+ production-ready Google dork templates for OSINT operations
 * Organized by category with severity ratings and detailed metadata
 *
 * @module dorkTemplates
 */

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type Category =
  | 'Cloud Storage'
  | 'Databases'
  | 'Login Panels'
  | 'Configuration Files'
  | 'API Keys & Secrets'
  | 'Exposed Directories'
  | 'Network Devices'
  | 'IoT & Cameras'
  | 'Development Files'
  | 'Backup Files'
  | 'Email & Documents'
  | 'Social Engineering'
  | 'Government & Public Records'
  | 'E-Commerce'
  | 'Custom Advanced';

export interface DorkTemplate {
  id: string;
  name: string;
  query: string;
  category: Category;
  description: string;
  severity: Severity;
  tags: string[];
  source?: string;
  notes?: string;
  legalWarning?: boolean;
}

// =============================================================================
// CLOUD STORAGE (18 templates)
// =============================================================================

const cloudStorageTemplates: DorkTemplate[] = [
  {
    id: 'cloud-001',
    name: 'Exposed AWS S3 Buckets',
    query: 'site:s3.amazonaws.com intitle:"index of"',
    category: 'Cloud Storage',
    description: 'Find open Amazon S3 buckets with directory listings enabled',
    severity: 'Critical',
    tags: ['AWS', 'S3', 'Cloud', 'Storage', 'Amazon'],
    legalWarning: true,
  },
  {
    id: 'cloud-002',
    name: 'Azure Blob Storage Leaks',
    query: 'site:blob.core.windows.net intitle:"index of"',
    category: 'Cloud Storage',
    description: 'Discover exposed Microsoft Azure blob storage containers',
    severity: 'Critical',
    tags: ['Azure', 'Microsoft', 'Cloud', 'Storage'],
    legalWarning: true,
  },
  {
    id: 'cloud-003',
    name: 'Google Cloud Storage Buckets',
    query: 'site:storage.googleapis.com intitle:"index of"',
    category: 'Cloud Storage',
    description: 'Find open Google Cloud Storage (GCS) buckets',
    severity: 'Critical',
    tags: ['GCP', 'Google', 'Cloud', 'Storage'],
    legalWarning: true,
  },
  {
    id: 'cloud-004',
    name: 'S3 Backup Files',
    query: 'site:s3.amazonaws.com (backup | backups | dump | dumps | archive)',
    category: 'Cloud Storage',
    description: 'Locate backup and dump files stored in S3 buckets',
    severity: 'Critical',
    tags: ['AWS', 'S3', 'Backup', 'Dump'],
  },
  {
    id: 'cloud-005',
    name: 'S3 Database Dumps',
    query: 'site:s3.amazonaws.com (sql | database | db | mysql | postgres | mongodb)',
    category: 'Cloud Storage',
    description: 'Find database dumps and SQL files in S3 storage',
    severity: 'Critical',
    tags: ['AWS', 'S3', 'Database', 'SQL'],
  },
  {
    id: 'cloud-006',
    name: 'S3 Configuration Files',
    query: 'site:s3.amazonaws.com (config | configuration | settings | .env)',
    category: 'Cloud Storage',
    description: 'Search for configuration files in S3 buckets',
    severity: 'High',
    tags: ['AWS', 'S3', 'Config'],
  },
  {
    id: 'cloud-007',
    name: 'S3 Log Files',
    query: 'site:s3.amazonaws.com (log | logs | access.log | error.log)',
    category: 'Cloud Storage',
    description: 'Find application and server log files in S3',
    severity: 'Medium',
    tags: ['AWS', 'S3', 'Logs'],
  },
  {
    id: 'cloud-008',
    name: 'Azure Configuration Files',
    query: 'site:blob.core.windows.net (config | settings | .env | secrets)',
    category: 'Cloud Storage',
    description: 'Locate configuration files in Azure blob storage',
    severity: 'High',
    tags: ['Azure', 'Config'],
  },
  {
    id: 'cloud-009',
    name: 'GCS Sensitive Documents',
    query: 'site:storage.googleapis.com (confidential | private | internal | sensitive)',
    category: 'Cloud Storage',
    description: 'Search for sensitive documents in GCS buckets',
    severity: 'High',
    tags: ['GCP', 'Documents'],
  },
  {
    id: 'cloud-010',
    name: 'DigitalOcean Spaces',
    query: 'site:digitaloceanspaces.com intitle:"index of"',
    category: 'Cloud Storage',
    description: 'Find exposed DigitalOcean Spaces object storage',
    severity: 'High',
    tags: ['DigitalOcean', 'Cloud', 'Storage'],
  },
  {
    id: 'cloud-011',
    name: 'Wasabi Cloud Storage',
    query: 'site:wasabisys.com intitle:"index of"',
    category: 'Cloud Storage',
    description: 'Discover exposed Wasabi cloud storage buckets',
    severity: 'High',
    tags: ['Wasabi', 'Cloud', 'Storage'],
  },
  {
    id: 'cloud-012',
    name: 'S3 Credentials Files',
    query: 'site:s3.amazonaws.com (credentials | aws_access_key | aws_secret)',
    category: 'Cloud Storage',
    description: 'Search for AWS credential files in S3 buckets',
    severity: 'Critical',
    tags: ['AWS', 'Credentials', 'Keys'],
  },
  {
    id: 'cloud-013',
    name: 'Cloud SQL Exports',
    query: 'site:storage.googleapis.com (export | sqldump | backup) filetype:sql',
    category: 'Cloud Storage',
    description: 'Find SQL database exports in Google Cloud Storage',
    severity: 'Critical',
    tags: ['GCP', 'SQL', 'Export'],
  },
  {
    id: 'cloud-014',
    name: 'Azure Private Files',
    query: 'site:blob.core.windows.net (private | confidential | internal)',
    category: 'Cloud Storage',
    description: 'Locate private documents in Azure blob storage',
    severity: 'High',
    tags: ['Azure', 'Private'],
  },
  {
    id: 'cloud-015',
    name: 'S3 Image Buckets',
    query: 'site:s3.amazonaws.com intitle:"index of" (jpg | png | jpeg | images)',
    category: 'Cloud Storage',
    description: 'Find exposed image galleries in S3 buckets',
    severity: 'Medium',
    tags: ['AWS', 'Images', 'Media'],
  },
  {
    id: 'cloud-016',
    name: 'Cloud Bucket Listings',
    query: 'inurl:s3.amazonaws.com | inurl:blob.core.windows.net | inurl:storage.googleapis.com "Parent Directory"',
    category: 'Cloud Storage',
    description: 'Universal search for cloud storage directory listings',
    severity: 'Critical',
    tags: ['Cloud', 'Multi-cloud'],
  },
  {
    id: 'cloud-017',
    name: 'S3 Video Storage',
    query: 'site:s3.amazonaws.com intitle:"index of" (mp4 | avi | mov | video)',
    category: 'Cloud Storage',
    description: 'Discover video files stored in S3 buckets',
    severity: 'Medium',
    tags: ['AWS', 'Video', 'Media'],
  },
  {
    id: 'cloud-018',
    name: 'Cloudflare R2 Storage',
    query: 'site:r2.cloudflarestorage.com intitle:"index of"',
    category: 'Cloud Storage',
    description: 'Find exposed Cloudflare R2 object storage',
    severity: 'High',
    tags: ['Cloudflare', 'R2', 'Storage'],
  },
];

// =============================================================================
// DATABASES (15 templates)
// =============================================================================

const databaseTemplates: DorkTemplate[] = [
  {
    id: 'db-001',
    name: 'phpMyAdmin Interfaces',
    query: 'inurl:phpmyadmin "phpMyAdmin" "Welcome to phpMyAdmin"',
    category: 'Databases',
    description: 'Find exposed phpMyAdmin database management interfaces',
    severity: 'Critical',
    tags: ['MySQL', 'phpMyAdmin', 'Database'],
    legalWarning: true,
  },
  {
    id: 'db-002',
    name: 'MongoDB Express',
    query: 'intitle:"mongo express" -github',
    category: 'Databases',
    description: 'Discover exposed MongoDB Express web interfaces',
    severity: 'Critical',
    tags: ['MongoDB', 'NoSQL', 'Database'],
    legalWarning: true,
  },
  {
    id: 'db-003',
    name: 'pgAdmin PostgreSQL',
    query: 'inurl:pgadmin "pgAdmin" -github',
    category: 'Databases',
    description: 'Locate exposed PostgreSQL pgAdmin interfaces',
    severity: 'Critical',
    tags: ['PostgreSQL', 'pgAdmin', 'Database'],
    legalWarning: true,
  },
  {
    id: 'db-004',
    name: 'SQL Dump Files',
    query: 'filetype:sql "INSERT INTO" (password | passwd | pwd)',
    category: 'Databases',
    description: 'Find SQL dump files containing password data',
    severity: 'Critical',
    tags: ['SQL', 'Dump', 'Passwords'],
  },
  {
    id: 'db-005',
    name: 'Database Backup Files',
    query: 'filetype:bak (sql | database | db | backup)',
    category: 'Databases',
    description: 'Search for database backup files (.bak extension)',
    severity: 'High',
    tags: ['Backup', 'Database'],
  },
  {
    id: 'db-006',
    name: 'Redis Instances',
    query: 'intitle:"Redis" "used memory" "connected clients" -github',
    category: 'Databases',
    description: 'Find exposed Redis in-memory database instances',
    severity: 'High',
    tags: ['Redis', 'Cache', 'Database'],
    legalWarning: true,
  },
  {
    id: 'db-007',
    name: 'MySQL Database Files',
    query: 'filetype:sql "CREATE TABLE" "INSERT INTO"',
    category: 'Databases',
    description: 'Locate MySQL database structure and data files',
    severity: 'High',
    tags: ['MySQL', 'SQL'],
  },
  {
    id: 'db-008',
    name: 'CouchDB Admin',
    query: 'intitle:"Apache CouchDB" "Futon" -github',
    category: 'Databases',
    description: 'Discover exposed CouchDB Futon admin interfaces',
    severity: 'Critical',
    tags: ['CouchDB', 'NoSQL'],
    legalWarning: true,
  },
  {
    id: 'db-009',
    name: 'Elasticsearch Interfaces',
    query: 'intitle:"elasticsearch" "cluster_name" -github',
    category: 'Databases',
    description: 'Find exposed Elasticsearch cluster interfaces',
    severity: 'Critical',
    tags: ['Elasticsearch', 'Search'],
    legalWarning: true,
  },
  {
    id: 'db-010',
    name: 'Adminer Database Tool',
    query: 'intitle:"Adminer" "Login" "Database" -github',
    category: 'Databases',
    description: 'Locate Adminer database management interfaces',
    severity: 'Critical',
    tags: ['Adminer', 'Database'],
    legalWarning: true,
  },
  {
    id: 'db-011',
    name: 'Cassandra CQL Interface',
    query: 'intitle:"Apache Cassandra" inurl:":9042"',
    category: 'Databases',
    description: 'Find exposed Apache Cassandra database interfaces',
    severity: 'High',
    tags: ['Cassandra', 'NoSQL'],
    legalWarning: true,
  },
  {
    id: 'db-012',
    name: 'SQLite Database Files',
    query: 'filetype:sqlite | filetype:db "SQLite format"',
    category: 'Databases',
    description: 'Search for exposed SQLite database files',
    severity: 'High',
    tags: ['SQLite', 'Database'],
  },
  {
    id: 'db-013',
    name: 'Oracle Database Exports',
    query: 'filetype:dmp oracle export',
    category: 'Databases',
    description: 'Find Oracle database export dump files',
    severity: 'Critical',
    tags: ['Oracle', 'Export'],
  },
  {
    id: 'db-014',
    name: 'Microsoft Access Databases',
    query: 'filetype:mdb | filetype:accdb',
    category: 'Databases',
    description: 'Locate exposed Microsoft Access database files',
    severity: 'Medium',
    tags: ['Access', 'Microsoft'],
  },
  {
    id: 'db-015',
    name: 'Database Connection Strings',
    query: '"Server=" "Database=" "User ID=" "Password="',
    category: 'Databases',
    description: 'Find exposed database connection strings with credentials',
    severity: 'Critical',
    tags: ['Credentials', 'Connection String'],
  },
];

// =============================================================================
// LOGIN PANELS (18 templates)
// =============================================================================

const loginTemplates: DorkTemplate[] = [
  {
    id: 'login-001',
    name: 'Admin Login Pages',
    query: 'intitle:"admin login" | intitle:"administrator login" | intitle:"admin panel"',
    category: 'Login Panels',
    description: 'Find administrative login pages and panels',
    severity: 'Medium',
    tags: ['Admin', 'Login'],
  },
  {
    id: 'login-002',
    name: 'WordPress Admin',
    query: 'inurl:wp-login.php',
    category: 'Login Panels',
    description: 'Locate WordPress admin login pages',
    severity: 'Medium',
    tags: ['WordPress', 'CMS'],
  },
  {
    id: 'login-003',
    name: 'cPanel Login',
    query: 'inurl:2082 | inurl:2083 "cPanel"',
    category: 'Login Panels',
    description: 'Find cPanel hosting control panel logins',
    severity: 'High',
    tags: ['cPanel', 'Hosting'],
  },
  {
    id: 'login-004',
    name: 'Atlassian Jira',
    query: 'inurl:"/secure/Dashboard.jspa" intitle:"Atlassian Jira"',
    category: 'Login Panels',
    description: 'Discover Jira project management login panels',
    severity: 'Medium',
    tags: ['Jira', 'Atlassian', 'Project Management'],
  },
  {
    id: 'login-005',
    name: 'Jenkins CI/CD',
    query: 'intitle:"Dashboard [Jenkins]"',
    category: 'Login Panels',
    description: 'Find Jenkins continuous integration dashboards',
    severity: 'High',
    tags: ['Jenkins', 'CI/CD', 'DevOps'],
  },
  {
    id: 'login-006',
    name: 'GitLab Login',
    query: 'intitle:"GitLab" inurl:"/users/sign_in"',
    category: 'Login Panels',
    description: 'Locate GitLab source control login pages',
    severity: 'Medium',
    tags: ['GitLab', 'Git', 'Source Control'],
  },
  {
    id: 'login-007',
    name: 'Grafana Dashboards',
    query: 'intitle:"Grafana" inurl:"/login"',
    category: 'Login Panels',
    description: 'Find Grafana analytics dashboard logins',
    severity: 'Medium',
    tags: ['Grafana', 'Analytics', 'Monitoring'],
  },
  {
    id: 'login-008',
    name: 'Kibana Interfaces',
    query: 'intitle:"Kibana" inurl:"/app/kibana"',
    category: 'Login Panels',
    description: 'Discover Kibana log analytics interfaces',
    severity: 'Medium',
    tags: ['Kibana', 'Elasticsearch', 'Logs'],
  },
  {
    id: 'login-009',
    name: 'Plesk Control Panel',
    query: 'inurl:8443 "Plesk"',
    category: 'Login Panels',
    description: 'Find Plesk hosting control panel logins',
    severity: 'High',
    tags: ['Plesk', 'Hosting'],
  },
  {
    id: 'login-010',
    name: 'RoundCube Webmail',
    query: 'intitle:"Roundcube Webmail" "Login"',
    category: 'Login Panels',
    description: 'Locate RoundCube webmail login interfaces',
    severity: 'Low',
    tags: ['Email', 'Webmail'],
  },
  {
    id: 'login-011',
    name: 'Fortinet SSL VPN',
    query: 'intitle:"Login" "Fortinet" "SSL-VPN"',
    category: 'Login Panels',
    description: 'Find Fortinet SSL VPN login portals',
    severity: 'High',
    tags: ['VPN', 'Fortinet', 'Network'],
  },
  {
    id: 'login-012',
    name: 'Cisco ASA VPN',
    query: 'intitle:"SSL VPN Service" "Cisco"',
    category: 'Login Panels',
    description: 'Discover Cisco ASA VPN login pages',
    severity: 'High',
    tags: ['VPN', 'Cisco', 'Network'],
  },
  {
    id: 'login-013',
    name: 'SonarQube Login',
    query: 'intitle:"SonarQube" inurl:"/sessions/new"',
    category: 'Login Panels',
    description: 'Find SonarQube code quality platform logins',
    severity: 'Medium',
    tags: ['SonarQube', 'Code Quality'],
  },
  {
    id: 'login-014',
    name: 'Splunk Login',
    query: 'intitle:"Splunk" inurl:"/en-US/account/login"',
    category: 'Login Panels',
    description: 'Locate Splunk log analysis platform logins',
    severity: 'Medium',
    tags: ['Splunk', 'Logs', 'SIEM'],
  },
  {
    id: 'login-015',
    name: 'Netgear Router Login',
    query: 'intitle:"NETGEAR Router" "Login"',
    category: 'Login Panels',
    description: 'Find Netgear router admin login pages',
    severity: 'Medium',
    tags: ['Router', 'Netgear', 'Network'],
  },
  {
    id: 'login-016',
    name: 'Outlook Web Access',
    query: 'intitle:"Outlook Web Access" "Sign In"',
    category: 'Login Panels',
    description: 'Discover Microsoft Outlook Web Access logins',
    severity: 'Low',
    tags: ['Email', 'Microsoft', 'Outlook'],
  },
  {
    id: 'login-017',
    name: 'Webmin Admin Panel',
    query: 'intitle:"Webmin" "Login"',
    category: 'Login Panels',
    description: 'Find Webmin server administration panels',
    severity: 'High',
    tags: ['Webmin', 'Server', 'Admin'],
  },
  {
    id: 'login-018',
    name: 'Apache Tomcat Manager',
    query: 'intitle:"Apache Tomcat" "Manager Application"',
    category: 'Login Panels',
    description: 'Locate Apache Tomcat manager application logins',
    severity: 'High',
    tags: ['Tomcat', 'Apache', 'Java'],
  },
];

// =============================================================================
// CONFIGURATION FILES (15 templates)
// =============================================================================

const configTemplates: DorkTemplate[] = [
  {
    id: 'config-001',
    name: 'Environment Files (.env)',
    query: 'filetype:env "DB_PASSWORD" | "API_KEY" | "SECRET"',
    category: 'Configuration Files',
    description: 'Find exposed environment configuration files with secrets',
    severity: 'Critical',
    tags: ['Environment', 'Secrets', 'Config'],
  },
  {
    id: 'config-002',
    name: 'Git Config Files',
    query: 'filetype:git OR inurl:".git/config"',
    category: 'Configuration Files',
    description: 'Discover exposed Git configuration files',
    severity: 'High',
    tags: ['Git', 'Version Control'],
  },
  {
    id: 'config-003',
    name: 'AWS Credentials',
    query: 'filetype:json "aws_access_key_id" OR "aws_secret_access_key"',
    category: 'Configuration Files',
    description: 'Search for exposed AWS credential files',
    severity: 'Critical',
    tags: ['AWS', 'Credentials', 'Keys'],
  },
  {
    id: 'config-004',
    name: 'SSH Private Keys',
    query: 'filetype:key "BEGIN RSA PRIVATE KEY" OR "BEGIN DSA PRIVATE KEY" OR "BEGIN OPENSSH PRIVATE KEY"',
    category: 'Configuration Files',
    description: 'Find exposed SSH private key files',
    severity: 'Critical',
    tags: ['SSH', 'Keys', 'Private Key'],
  },
  {
    id: 'config-005',
    name: 'Docker Compose Files',
    query: 'filetype:yml "docker-compose" (password | secret | api_key)',
    category: 'Configuration Files',
    description: 'Locate Docker Compose files with embedded secrets',
    severity: 'High',
    tags: ['Docker', 'Compose', 'Containers'],
  },
  {
    id: 'config-006',
    name: 'Kubernetes Secrets',
    query: 'filetype:yaml "kind: Secret" "data:"',
    category: 'Configuration Files',
    description: 'Find Kubernetes secret configuration files',
    severity: 'Critical',
    tags: ['Kubernetes', 'K8s', 'Secrets'],
  },
  {
    id: 'config-007',
    name: 'Nginx Configuration',
    query: 'filetype:conf inurl:nginx.conf',
    category: 'Configuration Files',
    description: 'Discover Nginx web server configuration files',
    severity: 'Medium',
    tags: ['Nginx', 'Web Server', 'Config'],
  },
  {
    id: 'config-008',
    name: 'Apache Configuration',
    query: 'filetype:conf inurl:httpd.conf',
    category: 'Configuration Files',
    description: 'Find Apache web server configuration files',
    severity: 'Medium',
    tags: ['Apache', 'Web Server', 'Config'],
  },
  {
    id: 'config-009',
    name: 'PHP Configuration',
    query: 'filetype:ini inurl:php.ini',
    category: 'Configuration Files',
    description: 'Locate PHP configuration files',
    severity: 'Medium',
    tags: ['PHP', 'Config'],
  },
  {
    id: 'config-010',
    name: 'Database Config Files',
    query: 'filetype:yml "database:" "username:" "password:"',
    category: 'Configuration Files',
    description: 'Search for database configuration with credentials',
    severity: 'Critical',
    tags: ['Database', 'Config', 'Credentials'],
  },
  {
    id: 'config-011',
    name: 'Firebase Config',
    query: 'filetype:json "firebase" "apiKey" "authDomain"',
    category: 'Configuration Files',
    description: 'Find Firebase configuration files with API keys',
    severity: 'High',
    tags: ['Firebase', 'Google', 'Config'],
  },
  {
    id: 'config-012',
    name: 'Terraform State Files',
    query: 'filetype:tfstate "terraform"',
    category: 'Configuration Files',
    description: 'Locate Terraform state files (may contain secrets)',
    severity: 'Critical',
    tags: ['Terraform', 'IaC', 'State'],
  },
  {
    id: 'config-013',
    name: 'Ansible Vault Files',
    query: 'filetype:yml "$ANSIBLE_VAULT"',
    category: 'Configuration Files',
    description: 'Find Ansible vault encrypted configuration files',
    severity: 'High',
    tags: ['Ansible', 'Vault', 'Config'],
  },
  {
    id: 'config-014',
    name: 'Web.config Files',
    query: 'filetype:config "connectionStrings" "password"',
    category: 'Configuration Files',
    description: 'Search for .NET web.config files with connection strings',
    severity: 'Critical',
    tags: ['.NET', 'Config', 'Database'],
  },
  {
    id: 'config-015',
    name: 'Registry Files',
    query: 'filetype:reg "Windows Registry"',
    category: 'Configuration Files',
    description: 'Find exported Windows registry configuration files',
    severity: 'Low',
    tags: ['Windows', 'Registry'],
  },
];

// =============================================================================
// API KEYS & SECRETS (12 templates)
// =============================================================================

const secretsTemplates: DorkTemplate[] = [
  {
    id: 'secrets-001',
    name: 'Stripe API Keys',
    query: '"sk_live_" OR "pk_live_" OR "rk_live_"',
    category: 'API Keys & Secrets',
    description: 'Find exposed Stripe payment processing API keys',
    severity: 'Critical',
    tags: ['Stripe', 'Payment', 'API Keys'],
  },
  {
    id: 'secrets-002',
    name: 'Slack Webhooks',
    query: '"https://hooks.slack.com/services/"',
    category: 'API Keys & Secrets',
    description: 'Discover Slack webhook URLs',
    severity: 'High',
    tags: ['Slack', 'Webhook', 'API'],
  },
  {
    id: 'secrets-003',
    name: 'GitHub Personal Tokens',
    query: '"ghp_" OR "gho_" OR "github_pat_"',
    category: 'API Keys & Secrets',
    description: 'Search for GitHub personal access tokens',
    severity: 'Critical',
    tags: ['GitHub', 'Token', 'API'],
  },
  {
    id: 'secrets-004',
    name: 'SendGrid API Keys',
    query: '"SG." AND "sendgrid"',
    category: 'API Keys & Secrets',
    description: 'Find SendGrid email service API keys',
    severity: 'High',
    tags: ['SendGrid', 'Email', 'API'],
  },
  {
    id: 'secrets-005',
    name: 'Twilio Credentials',
    query: '"AC" AND "SK" AND "twilio"',
    category: 'API Keys & Secrets',
    description: 'Locate Twilio communication platform credentials',
    severity: 'High',
    tags: ['Twilio', 'SMS', 'API'],
  },
  {
    id: 'secrets-006',
    name: 'Firebase API Keys',
    query: '"AIzaSy" AND "firebase"',
    category: 'API Keys & Secrets',
    description: 'Find Firebase Google Cloud API keys',
    severity: 'High',
    tags: ['Firebase', 'Google', 'API'],
  },
  {
    id: 'secrets-007',
    name: 'Mailgun API Keys',
    query: '"key-" AND "mailgun"',
    category: 'API Keys & Secrets',
    description: 'Search for Mailgun email API keys',
    severity: 'High',
    tags: ['Mailgun', 'Email', 'API'],
  },
  {
    id: 'secrets-008',
    name: 'Heroku API Keys',
    query: '"heroku" AND "api_key"',
    category: 'API Keys & Secrets',
    description: 'Find Heroku platform API keys',
    severity: 'High',
    tags: ['Heroku', 'Platform', 'API'],
  },
  {
    id: 'secrets-009',
    name: 'Square Access Tokens',
    query: '"sq0atp-" OR "sq0csp-"',
    category: 'API Keys & Secrets',
    description: 'Discover Square payment processing access tokens',
    severity: 'Critical',
    tags: ['Square', 'Payment', 'Token'],
  },
  {
    id: 'secrets-010',
    name: 'PayPal Client IDs',
    query: '"paypal" AND "client_id" AND "client_secret"',
    category: 'API Keys & Secrets',
    description: 'Locate PayPal API client credentials',
    severity: 'Critical',
    tags: ['PayPal', 'Payment', 'API'],
  },
  {
    id: 'secrets-011',
    name: 'Google API Keys',
    query: '"AIzaSy" -firebase -example',
    category: 'API Keys & Secrets',
    description: 'Find generic Google Cloud API keys',
    severity: 'High',
    tags: ['Google', 'API', 'Cloud'],
  },
  {
    id: 'secrets-012',
    name: 'Generic API Tokens',
    query: '"api_token" OR "api_secret" OR "access_token" filetype:env',
    category: 'API Keys & Secrets',
    description: 'Search for generic API tokens in environment files',
    severity: 'High',
    tags: ['API', 'Token', 'Generic'],
  },
];

// =============================================================================
// EXPOSED DIRECTORIES (12 templates)
// =============================================================================

const directoryTemplates: DorkTemplate[] = [
  {
    id: 'dir-001',
    name: 'Directory Listings',
    query: 'intitle:"index of" inurl:backup',
    category: 'Exposed Directories',
    description: 'Find directories with backup files exposed',
    severity: 'Medium',
    tags: ['Directory', 'Backup'],
  },
  {
    id: 'dir-002',
    name: 'Backup Directories',
    query: 'intitle:"index of" "backup" | "backups"',
    category: 'Exposed Directories',
    description: 'Search for exposed backup directories',
    severity: 'High',
    tags: ['Backup', 'Directory'],
  },
  {
    id: 'dir-003',
    name: 'Log Directories',
    query: 'intitle:"index of" "logs" | "log"',
    category: 'Exposed Directories',
    description: 'Find exposed log file directories',
    severity: 'Medium',
    tags: ['Logs', 'Directory'],
  },
  {
    id: 'dir-004',
    name: 'Upload Directories',
    query: 'intitle:"index of" "uploads"',
    category: 'Exposed Directories',
    description: 'Discover exposed upload directories',
    severity: 'Medium',
    tags: ['Uploads', 'Directory'],
  },
  {
    id: 'dir-005',
    name: 'FTP Directories',
    query: 'intitle:"index of" "ftp"',
    category: 'Exposed Directories',
    description: 'Locate exposed FTP directories',
    severity: 'Medium',
    tags: ['FTP', 'Directory'],
  },
  {
    id: 'dir-006',
    name: 'Download Directories',
    query: 'intitle:"index of" "downloads"',
    category: 'Exposed Directories',
    description: 'Find exposed download directories',
    severity: 'Low',
    tags: ['Downloads', 'Directory'],
  },
  {
    id: 'dir-007',
    name: 'Admin Directories',
    query: 'intitle:"index of" "admin"',
    category: 'Exposed Directories',
    description: 'Search for exposed admin directories',
    severity: 'High',
    tags: ['Admin', 'Directory'],
  },
  {
    id: 'dir-008',
    name: 'Private Directories',
    query: 'intitle:"index of" "private"',
    category: 'Exposed Directories',
    description: 'Discover exposed private directories',
    severity: 'High',
    tags: ['Private', 'Directory'],
  },
  {
    id: 'dir-009',
    name: 'Config Directories',
    query: 'intitle:"index of" "config" | "configuration"',
    category: 'Exposed Directories',
    description: 'Find exposed configuration directories',
    severity: 'High',
    tags: ['Config', 'Directory'],
  },
  {
    id: 'dir-010',
    name: 'Temp Directories',
    query: 'intitle:"index of" "temp" | "tmp"',
    category: 'Exposed Directories',
    description: 'Locate exposed temporary directories',
    severity: 'Medium',
    tags: ['Temp', 'Directory'],
  },
  {
    id: 'dir-011',
    name: 'Data Directories',
    query: 'intitle:"index of" "data"',
    category: 'Exposed Directories',
    description: 'Search for exposed data directories',
    severity: 'High',
    tags: ['Data', 'Directory'],
  },
  {
    id: 'dir-012',
    name: 'Root Directories',
    query: 'intitle:"index of /" "Parent Directory"',
    category: 'Exposed Directories',
    description: 'Find exposed root directory listings',
    severity: 'High',
    tags: ['Root', 'Directory'],
  },
];

// =============================================================================
// NETWORK DEVICES (10 templates)
// =============================================================================

const networkTemplates: DorkTemplate[] = [
  {
    id: 'net-001',
    name: 'IP Cameras',
    query: 'inurl:"/view/index.shtml" OR inurl:"/view.shtml"',
    category: 'Network Devices',
    description: 'Find exposed IP security cameras',
    severity: 'High',
    tags: ['Camera', 'IP Camera', 'Surveillance'],
    legalWarning: true,
  },
  {
    id: 'net-002',
    name: 'Webcams',
    query: 'intitle:"webcam" inurl:":8080" OR inurl:":8081"',
    category: 'Network Devices',
    description: 'Discover accessible webcam interfaces',
    severity: 'Medium',
    tags: ['Webcam', 'Camera'],
    legalWarning: true,
  },
  {
    id: 'net-003',
    name: 'Router Admin Panels',
    query: 'intitle:"Router" "Login" | "admin"',
    category: 'Network Devices',
    description: 'Locate router administration interfaces',
    severity: 'High',
    tags: ['Router', 'Network', 'Admin'],
  },
  {
    id: 'net-004',
    name: 'Network Printers',
    query: 'inurl:"/hp/device/this.LCDispatcher"',
    category: 'Network Devices',
    description: 'Find HP network printer web interfaces',
    severity: 'Low',
    tags: ['Printer', 'HP', 'Network'],
  },
  {
    id: 'net-005',
    name: 'NAS Devices',
    query: 'intitle:"Welcome to" "Network Attached Storage"',
    category: 'Network Devices',
    description: 'Search for Network Attached Storage devices',
    severity: 'High',
    tags: ['NAS', 'Storage', 'Network'],
  },
  {
    id: 'net-006',
    name: 'Ubiquiti Devices',
    query: 'intitle:"UniFi" "Controller"',
    category: 'Network Devices',
    description: 'Find Ubiquiti UniFi network controllers',
    severity: 'Medium',
    tags: ['Ubiquiti', 'UniFi', 'Network'],
  },
  {
    id: 'net-007',
    name: 'Mikrotik Routers',
    query: 'intitle:"RouterOS" "MikroTik"',
    category: 'Network Devices',
    description: 'Locate MikroTik RouterOS interfaces',
    severity: 'High',
    tags: ['MikroTik', 'Router'],
  },
  {
    id: 'net-008',
    name: 'Cisco Switches',
    query: 'intitle:"Cisco" "Switch" "Web Interface"',
    category: 'Network Devices',
    description: 'Find Cisco switch web management interfaces',
    severity: 'High',
    tags: ['Cisco', 'Switch', 'Network'],
  },
  {
    id: 'net-009',
    name: 'SNMP Devices',
    query: 'intitle:"SNMP" "System" "uptime"',
    category: 'Network Devices',
    description: 'Search for devices with exposed SNMP interfaces',
    severity: 'Medium',
    tags: ['SNMP', 'Monitoring'],
  },
  {
    id: 'net-010',
    name: 'VoIP Phones',
    query: 'intitle:"Asterisk" "PBX" OR intitle:"FreePBX"',
    category: 'Network Devices',
    description: 'Find VoIP phone system interfaces',
    severity: 'Medium',
    tags: ['VoIP', 'Phone', 'Asterisk'],
  },
];

// =============================================================================
// IoT & CAMERAS (10 templates)
// =============================================================================

const iotTemplates: DorkTemplate[] = [
  {
    id: 'iot-001',
    name: 'Smart Home Devices',
    query: 'intitle:"smart home" inurl:":8080"',
    category: 'IoT & Cameras',
    description: 'Find smart home device interfaces',
    severity: 'Medium',
    tags: ['Smart Home', 'IoT'],
    legalWarning: true,
  },
  {
    id: 'iot-002',
    name: 'Building Management Systems',
    query: 'intitle:"building management" inurl:login',
    category: 'IoT & Cameras',
    description: 'Discover building automation system logins',
    severity: 'High',
    tags: ['BMS', 'Building', 'Automation'],
    legalWarning: true,
  },
  {
    id: 'iot-003',
    name: 'SCADA Systems',
    query: 'intitle:"SCADA" OR intitle:"HMI" -github',
    category: 'IoT & Cameras',
    description: 'Find industrial control SCADA interfaces',
    severity: 'Critical',
    tags: ['SCADA', 'ICS', 'Industrial'],
    legalWarning: true,
  },
  {
    id: 'iot-004',
    name: 'DVR Systems',
    query: 'intitle:"DVR" "Web Client"',
    category: 'IoT & Cameras',
    description: 'Locate Digital Video Recorder web interfaces',
    severity: 'Medium',
    tags: ['DVR', 'Camera', 'Surveillance'],
    legalWarning: true,
  },
  {
    id: 'iot-005',
    name: 'Smart Thermostats',
    query: 'intitle:"Nest" OR intitle:"Ecobee" "Thermostat"',
    category: 'IoT & Cameras',
    description: 'Find smart thermostat interfaces',
    severity: 'Low',
    tags: ['Thermostat', 'Smart Home'],
  },
  {
    id: 'iot-006',
    name: 'Solar Panels',
    query: 'intitle:"Solar" "Inverter" "Monitoring"',
    category: 'IoT & Cameras',
    description: 'Search for solar panel monitoring systems',
    severity: 'Low',
    tags: ['Solar', 'Energy'],
  },
  {
    id: 'iot-007',
    name: 'Vehicle Trackers',
    query: 'intitle:"GPS Tracker" "Vehicle"',
    category: 'IoT & Cameras',
    description: 'Find vehicle GPS tracking interfaces',
    severity: 'Medium',
    tags: ['GPS', 'Tracking', 'Vehicle'],
    legalWarning: true,
  },
  {
    id: 'iot-008',
    name: 'Smart Locks',
    query: 'intitle:"Smart Lock" "Control Panel"',
    category: 'IoT & Cameras',
    description: 'Discover smart lock control interfaces',
    severity: 'High',
    tags: ['Smart Lock', 'Security'],
    legalWarning: true,
  },
  {
    id: 'iot-009',
    name: 'Weather Stations',
    query: 'intitle:"Weather Station" "Live Data"',
    category: 'IoT & Cameras',
    description: 'Find personal weather station interfaces',
    severity: 'Low',
    tags: ['Weather', 'Sensor'],
  },
  {
    id: 'iot-010',
    name: 'Water Treatment',
    query: 'intitle:"Water Treatment" "SCADA"',
    category: 'IoT & Cameras',
    description: 'Search for water treatment facility controls',
    severity: 'Critical',
    tags: ['Water', 'SCADA', 'Infrastructure'],
    legalWarning: true,
  },
];

// =============================================================================
// DEVELOPMENT FILES (8 templates)
// =============================================================================

const devTemplates: DorkTemplate[] = [
  {
    id: 'dev-001',
    name: 'Exposed .git Directories',
    query: 'inurl:"/.git/HEAD"',
    category: 'Development Files',
    description: 'Find exposed Git repository directories',
    severity: 'High',
    tags: ['Git', 'Source Code'],
  },
  {
    id: 'dev-002',
    name: 'Swagger API Docs',
    query: 'inurl:"/swagger-ui.html" OR inurl:"/api/docs"',
    category: 'Development Files',
    description: 'Discover Swagger API documentation interfaces',
    severity: 'Medium',
    tags: ['Swagger', 'API', 'Documentation'],
  },
  {
    id: 'dev-003',
    name: 'GraphQL Endpoints',
    query: 'inurl:"/graphql" intext:"graphiql"',
    category: 'Development Files',
    description: 'Find GraphQL API endpoints with GraphiQL',
    severity: 'Medium',
    tags: ['GraphQL', 'API'],
  },
  {
    id: 'dev-004',
    name: 'Package.json Files',
    query: 'filetype:json "dependencies" ("react" OR "vue" OR "angular")',
    category: 'Development Files',
    description: 'Search for Node.js package.json files',
    severity: 'Low',
    tags: ['Node.js', 'JavaScript'],
  },
  {
    id: 'dev-005',
    name: 'Composer.json Files',
    query: 'filetype:json "composer" "require"',
    category: 'Development Files',
    description: 'Find PHP Composer dependency files',
    severity: 'Low',
    tags: ['PHP', 'Composer'],
  },
  {
    id: 'dev-006',
    name: 'Requirements.txt Files',
    query: 'filetype:txt "requirements" ("django" OR "flask" OR "fastapi")',
    category: 'Development Files',
    description: 'Locate Python requirements files',
    severity: 'Low',
    tags: ['Python', 'Dependencies'],
  },
  {
    id: 'dev-007',
    name: 'Gemfile Files',
    query: 'filetype:gemfile "source" "gem"',
    category: 'Development Files',
    description: 'Search for Ruby Gemfile dependency files',
    severity: 'Low',
    tags: ['Ruby', 'Gems'],
  },
  {
    id: 'dev-008',
    name: 'API Documentation',
    query: 'intitle:"API Documentation" (swagger | openapi | redoc)',
    category: 'Development Files',
    description: 'Find API documentation pages',
    severity: 'Low',
    tags: ['API', 'Documentation'],
  },
];

// =============================================================================
// BACKUP FILES (8 templates)
// =============================================================================

const backupTemplates: DorkTemplate[] = [
  {
    id: 'backup-001',
    name: 'SQL Backup Files',
    query: 'filetype:sql ("backup" OR "dump")',
    category: 'Backup Files',
    description: 'Find SQL database backup dump files',
    severity: 'Critical',
    tags: ['SQL', 'Backup', 'Database'],
  },
  {
    id: 'backup-002',
    name: 'ZIP Backup Archives',
    query: 'filetype:zip ("backup" OR "site" OR "www")',
    category: 'Backup Files',
    description: 'Search for ZIP archive backups',
    severity: 'High',
    tags: ['ZIP', 'Archive', 'Backup'],
  },
  {
    id: 'backup-003',
    name: 'TAR Archives',
    query: 'filetype:tar OR filetype:tar.gz ("backup" OR "archive")',
    category: 'Backup Files',
    description: 'Find TAR/GZ backup archives',
    severity: 'High',
    tags: ['TAR', 'Archive', 'Backup'],
  },
  {
    id: 'backup-004',
    name: 'WordPress Backups',
    query: 'filetype:zip "wp-content" OR "wordpress"',
    category: 'Backup Files',
    description: 'Locate WordPress site backups',
    severity: 'High',
    tags: ['WordPress', 'Backup'],
  },
  {
    id: 'backup-005',
    name: 'VM Snapshots',
    query: 'filetype:vmdk OR filetype:vhd ("backup" OR "snapshot")',
    category: 'Backup Files',
    description: 'Find virtual machine snapshot files',
    severity: 'High',
    tags: ['VM', 'Snapshot', 'Virtualization'],
  },
  {
    id: 'backup-006',
    name: 'Compressed Backups',
    query: 'filetype:rar OR filetype:7z "backup"',
    category: 'Backup Files',
    description: 'Search for RAR/7Z compressed backups',
    severity: 'High',
    tags: ['RAR', '7Z', 'Backup'],
  },
  {
    id: 'backup-007',
    name: 'Old Backups',
    query: 'intitle:"index of" ("backup.old" OR "site.old" OR ".bak")',
    category: 'Backup Files',
    description: 'Find old backup file directories',
    severity: 'Medium',
    tags: ['Old', 'Backup'],
  },
  {
    id: 'backup-008',
    name: 'Config Backups',
    query: 'filetype:bak ("config" OR "configuration")',
    category: 'Backup Files',
    description: 'Locate configuration backup files',
    severity: 'High',
    tags: ['Config', 'Backup'],
  },
];

// =============================================================================
// EMAIL & DOCUMENTS (8 templates)
// =============================================================================

const emailDocTemplates: DorkTemplate[] = [
  {
    id: 'email-001',
    name: 'Email Lists',
    query: 'filetype:xls OR filetype:xlsx "email" "name"',
    category: 'Email & Documents',
    description: 'Find spreadsheets containing email lists',
    severity: 'Medium',
    tags: ['Email', 'Spreadsheet'],
  },
  {
    id: 'email-002',
    name: 'PDF Documents',
    query: 'filetype:pdf ("confidential" OR "internal" OR "private")',
    category: 'Email & Documents',
    description: 'Search for confidential PDF documents',
    severity: 'Medium',
    tags: ['PDF', 'Documents'],
  },
  {
    id: 'email-003',
    name: 'Word Documents',
    query: 'filetype:doc OR filetype:docx ("confidential" OR "draft")',
    category: 'Email & Documents',
    description: 'Find confidential Word documents',
    severity: 'Medium',
    tags: ['Word', 'Documents'],
  },
  {
    id: 'email-004',
    name: 'Outlook PST Files',
    query: 'filetype:pst "outlook"',
    category: 'Email & Documents',
    description: 'Locate Outlook email archive PST files',
    severity: 'High',
    tags: ['Outlook', 'Email', 'PST'],
  },
  {
    id: 'email-005',
    name: 'Contact Lists',
    query: 'filetype:csv ("contact" OR "email" OR "phone")',
    category: 'Email & Documents',
    description: 'Find CSV files with contact information',
    severity: 'Medium',
    tags: ['CSV', 'Contacts'],
  },
  {
    id: 'email-006',
    name: 'Financial Documents',
    query: 'filetype:xls ("invoice" OR "payment" OR "transaction")',
    category: 'Email & Documents',
    description: 'Search for financial Excel spreadsheets',
    severity: 'High',
    tags: ['Financial', 'Excel'],
  },
  {
    id: 'email-007',
    name: 'Resume/CV Files',
    query: 'filetype:pdf ("resume" OR "curriculum vitae" OR "CV")',
    category: 'Email & Documents',
    description: 'Find resume and CV PDF files',
    severity: 'Low',
    tags: ['Resume', 'CV', 'HR'],
  },
  {
    id: 'email-008',
    name: 'Presentation Files',
    query: 'filetype:ppt OR filetype:pptx ("confidential" OR "internal")',
    category: 'Email & Documents',
    description: 'Locate confidential PowerPoint presentations',
    severity: 'Medium',
    tags: ['PowerPoint', 'Presentation'],
  },
];

// =============================================================================
// SOCIAL ENGINEERING (6 templates)
// =============================================================================

const socialTemplates: DorkTemplate[] = [
  {
    id: 'social-001',
    name: 'Employee Directories',
    query: 'intitle:"employee directory" OR intitle:"staff directory"',
    category: 'Social Engineering',
    description: 'Find organizational employee directories',
    severity: 'Low',
    tags: ['Employees', 'Directory'],
  },
  {
    id: 'social-002',
    name: 'Organizational Charts',
    query: 'filetype:pdf "organizational chart" OR "org chart"',
    category: 'Social Engineering',
    description: 'Search for organizational structure charts',
    severity: 'Low',
    tags: ['Org Chart', 'Structure'],
  },
  {
    id: 'social-003',
    name: 'Phone Lists',
    query: 'filetype:xls "extension" "phone" "name"',
    category: 'Social Engineering',
    description: 'Find employee phone extension lists',
    severity: 'Low',
    tags: ['Phone', 'Contact'],
  },
  {
    id: 'social-004',
    name: 'Email Signatures',
    query: '"email signature" (template OR example)',
    category: 'Social Engineering',
    description: 'Locate email signature templates revealing structure',
    severity: 'Low',
    tags: ['Email', 'Signature'],
  },
  {
    id: 'social-005',
    name: 'Meeting Notes',
    query: 'filetype:doc OR filetype:docx "meeting notes" "attendees"',
    category: 'Social Engineering',
    description: 'Search for meeting notes with attendee lists',
    severity: 'Low',
    tags: ['Meetings', 'Notes'],
  },
  {
    id: 'social-006',
    name: 'LinkedIn Profiles',
    query: 'site:linkedin.com "company" (CEO OR CTO OR CISO)',
    category: 'Social Engineering',
    description: 'Find company executive LinkedIn profiles',
    severity: 'Low',
    tags: ['LinkedIn', 'Executives'],
  },
];

// =============================================================================
// GOVERNMENT & PUBLIC RECORDS (5 templates)
// =============================================================================

const govTemplates: DorkTemplate[] = [
  {
    id: 'gov-001',
    name: 'Government Documents',
    query: 'site:.gov filetype:pdf confidential',
    category: 'Government & Public Records',
    description: 'Search for confidential government PDF documents',
    severity: 'Low',
    tags: ['Government', 'PDF'],
  },
  {
    id: 'gov-002',
    name: 'Court Records',
    query: 'site:.gov "court records" OR "case number"',
    category: 'Government & Public Records',
    description: 'Find government court record databases',
    severity: 'Low',
    tags: ['Court', 'Legal'],
  },
  {
    id: 'gov-003',
    name: 'Property Records',
    query: 'site:.gov "property records" "owner"',
    category: 'Government & Public Records',
    description: 'Search for public property ownership records',
    severity: 'Low',
    tags: ['Property', 'Records'],
  },
  {
    id: 'gov-004',
    name: 'Voter Registration',
    query: 'site:.gov "voter registration" database',
    category: 'Government & Public Records',
    description: 'Find voter registration databases',
    severity: 'Low',
    tags: ['Voter', 'Registration'],
  },
  {
    id: 'gov-005',
    name: 'Public Contracts',
    query: 'site:.gov filetype:pdf "contract" "awarded to"',
    category: 'Government & Public Records',
    description: 'Locate government contract award documents',
    severity: 'Low',
    tags: ['Contracts', 'Government'],
  },
];

// =============================================================================
// E-COMMERCE (5 templates)
// =============================================================================

const ecommerceTemplates: DorkTemplate[] = [
  {
    id: 'ecom-001',
    name: 'Magento Stores',
    query: 'inurl:"/customer/account/login" "Magento"',
    category: 'E-Commerce',
    description: 'Find Magento e-commerce store logins',
    severity: 'Medium',
    tags: ['Magento', 'E-commerce'],
  },
  {
    id: 'ecom-002',
    name: 'WooCommerce Stores',
    query: 'inurl:"/wp-admin" "WooCommerce"',
    category: 'E-Commerce',
    description: 'Discover WooCommerce online stores',
    severity: 'Medium',
    tags: ['WooCommerce', 'WordPress'],
  },
  {
    id: 'ecom-003',
    name: 'Shopify Stores',
    query: 'site:myshopify.com',
    category: 'E-Commerce',
    description: 'Search for Shopify-hosted online stores',
    severity: 'Low',
    tags: ['Shopify', 'E-commerce'],
  },
  {
    id: 'ecom-004',
    name: 'Payment Pages',
    query: 'inurl:"/checkout" OR inurl:"/payment"',
    category: 'E-Commerce',
    description: 'Find e-commerce checkout and payment pages',
    severity: 'Low',
    tags: ['Payment', 'Checkout'],
  },
  {
    id: 'ecom-005',
    name: 'Order Confirmations',
    query: 'intext:"order confirmation" "total amount" filetype:pdf',
    category: 'E-Commerce',
    description: 'Locate exposed order confirmation documents',
    severity: 'Medium',
    tags: ['Orders', 'Confirmation'],
  },
];

// =============================================================================
// CUSTOM ADVANCED (5 templates)
// =============================================================================

const advancedTemplates: DorkTemplate[] = [
  {
    id: 'adv-001',
    name: 'Subdomain Enumeration',
    query: 'site:*.example.com -www',
    category: 'Custom Advanced',
    description: 'Enumerate subdomains of a target domain (replace example.com)',
    severity: 'Low',
    tags: ['Subdomains', 'Reconnaissance'],
    notes: 'Replace example.com with your target domain',
  },
  {
    id: 'adv-002',
    name: 'Technology Stack Detection',
    query: 'site:example.com (inurl:wp- | inurl:wordpress | "Powered by" | "Built with")',
    category: 'Custom Advanced',
    description: 'Identify technologies used by a website',
    severity: 'Low',
    tags: ['Technology', 'Stack'],
    notes: 'Replace example.com with target domain',
  },
  {
    id: 'adv-003',
    name: 'Employees Search',
    query: 'site:linkedin.com "Company Name" (engineer | developer | admin)',
    category: 'Custom Advanced',
    description: 'Find employees of a specific company on LinkedIn',
    severity: 'Low',
    tags: ['LinkedIn', 'Employees'],
    notes: 'Replace Company Name with target organization',
  },
  {
    id: 'adv-004',
    name: 'Cached Content',
    query: 'cache:example.com',
    category: 'Custom Advanced',
    description: 'View Google\'s cached version of a website',
    severity: 'Low',
    tags: ['Cache', 'Archive'],
    notes: 'Replace example.com with target URL',
  },
  {
    id: 'adv-005',
    name: 'Related Sites',
    query: 'related:example.com',
    category: 'Custom Advanced',
    description: 'Find websites similar to a target domain',
    severity: 'Low',
    tags: ['Related', 'Similar'],
    notes: 'Replace example.com with target domain',
  },
];

// =============================================================================
// COMBINE ALL TEMPLATES
// =============================================================================

export const DORK_TEMPLATES: DorkTemplate[] = [
  ...cloudStorageTemplates,
  ...databaseTemplates,
  ...loginTemplates,
  ...configTemplates,
  ...secretsTemplates,
  ...directoryTemplates,
  ...networkTemplates,
  ...iotTemplates,
  ...devTemplates,
  ...backupTemplates,
  ...emailDocTemplates,
  ...socialTemplates,
  ...govTemplates,
  ...ecommerceTemplates,
  ...advancedTemplates,
];

export const TEMPLATE_CATEGORIES = [
  'Cloud Storage',
  'Databases',
  'Login Panels',
  'Configuration Files',
  'API Keys & Secrets',
  'Exposed Directories',
  'Network Devices',
  'IoT & Cameras',
  'Development Files',
  'Backup Files',
  'Email & Documents',
  'Social Engineering',
  'Government & Public Records',
  'E-Commerce',
  'Custom Advanced',
] as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getTemplatesByCategory(category: string): DorkTemplate[] {
  return DORK_TEMPLATES.filter(t => t.category === category);
}

export function searchTemplates(query: string): DorkTemplate[] {
  const lowerQuery = query.toLowerCase();
  return DORK_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.query.toLowerCase().includes(lowerQuery) ||
    t.description?.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getTemplateById(id: string): DorkTemplate | undefined {
  return DORK_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesBySeverity(severity: Severity): DorkTemplate[] {
  return DORK_TEMPLATES.filter(t => t.severity === severity);
}

export function getTemplatesByTag(tag: string): DorkTemplate[] {
  return DORK_TEMPLATES.filter(t =>
    t.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): string[] {
  const allTags = new Set<string>();
  DORK_TEMPLATES.forEach(t => t.tags.forEach(tag => allTags.add(tag)));
  return Array.from(allTags).sort();
}

export function getTemplateStats() {
  return {
    total: DORK_TEMPLATES.length,
    byCategory: TEMPLATE_CATEGORIES.map(cat => ({
      category: cat,
      count: getTemplatesByCategory(cat).length,
    })),
    bySeverity: {
      critical: getTemplatesBySeverity('Critical').length,
      high: getTemplatesBySeverity('High').length,
      medium: getTemplatesBySeverity('Medium').length,
      low: getTemplatesBySeverity('Low').length,
    },
    withLegalWarning: DORK_TEMPLATES.filter(t => t.legalWarning).length,
  };
}

// Export template count for verification
console.log(`✓ Loaded ${DORK_TEMPLATES.length} dork templates across ${TEMPLATE_CATEGORIES.length} categories`);
