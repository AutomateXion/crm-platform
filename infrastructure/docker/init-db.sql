-- =============================================================================
-- CRM PLATFORM - DATABASE INITIALIZATION
-- Core Platform Database Schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy search

-- =============================================================================
-- TENANTS
-- =============================================================================
CREATE TABLE tenants (
    tenant_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_code       VARCHAR(50) UNIQUE NOT NULL,
    company_name      VARCHAR(200) NOT NULL,
    domain            VARCHAR(200),
    subscription_plan VARCHAR(50) DEFAULT 'STARTER', -- STARTER, PROFESSIONAL, ENTERPRISE
    active_modules    TEXT[] DEFAULT ARRAY['core','contacts','leads','sales','activities'],
    timezone          VARCHAR(50) DEFAULT 'Asia/Muscat',
    date_format       VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    currency_code     VARCHAR(3) DEFAULT 'OMR',
    logo_url          TEXT,
    primary_color     VARCHAR(7) DEFAULT '#1890ff',
    language          VARCHAR(5) DEFAULT 'en',
    is_active         BOOLEAN DEFAULT true,
    trial_ends_at     TIMESTAMP,
    max_users         INTEGER DEFAULT 10,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- USER GROUPS (ROLES)
-- =============================================================================
CREATE TABLE user_groups (
    user_group_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id         UUID NOT NULL REFERENCES tenants(tenant_id),
    group_code        VARCHAR(50) NOT NULL,
    group_name        VARCHAR(100) NOT NULL,
    group_name_ar     VARCHAR(100),
    is_system_group   BOOLEAN DEFAULT false,
    description       TEXT,
    is_active         BOOLEAN DEFAULT true,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, group_code)
);

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE users (
    user_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id         UUID NOT NULL REFERENCES tenants(tenant_id),
    user_group_id     UUID REFERENCES user_groups(user_group_id),
    email             VARCHAR(255) NOT NULL,
    full_name         VARCHAR(200) NOT NULL,
    full_name_ar      VARCHAR(200),
    phone             VARCHAR(50),
    avatar_url        TEXT,
    password_hash     TEXT NOT NULL,
    is_active         BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    email_verify_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret  TEXT,
    last_login        TIMESTAMP,
    login_count       INTEGER DEFAULT 0,
    failed_login_count INTEGER DEFAULT 0,
    locked_until      TIMESTAMP,
    timezone          VARCHAR(50),
    language          VARCHAR(5) DEFAULT 'en',
    created_by        UUID REFERENCES users(user_id),
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- =============================================================================
-- MODULES REGISTRY
-- =============================================================================
CREATE TABLE modules (
    module_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_code       VARCHAR(50) UNIQUE NOT NULL,
    module_name       VARCHAR(100) NOT NULL,
    module_name_ar    VARCHAR(100),
    module_icon       VARCHAR(100),
    module_color      VARCHAR(7),
    sort_order        INTEGER DEFAULT 0,
    is_core           BOOLEAN DEFAULT false,
    is_active         BOOLEAN DEFAULT true,
    description       TEXT,
    created_at        TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- SUB MODULES
-- =============================================================================
CREATE TABLE sub_modules (
    sub_module_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id         UUID NOT NULL REFERENCES modules(module_id),
    sub_module_code   VARCHAR(50) NOT NULL,
    sub_module_name   VARCHAR(100) NOT NULL,
    sub_module_name_ar VARCHAR(100),
    sort_order        INTEGER DEFAULT 0,
    is_active         BOOLEAN DEFAULT true,
    UNIQUE(module_id, sub_module_code)
);

-- =============================================================================
-- PAGES
-- =============================================================================
CREATE TABLE pages (
    page_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_module_id     UUID NOT NULL REFERENCES sub_modules(sub_module_id),
    page_code         VARCHAR(50) NOT NULL,
    page_name         VARCHAR(100) NOT NULL,
    page_name_ar      VARCHAR(100),
    page_route        VARCHAR(200),
    sort_order        INTEGER DEFAULT 0,
    is_active         BOOLEAN DEFAULT true,
    UNIQUE(sub_module_id, page_code)
);

-- =============================================================================
-- FIELDS
-- =============================================================================
CREATE TABLE fields (
    field_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id           UUID NOT NULL REFERENCES pages(page_id),
    field_code        VARCHAR(100) NOT NULL,
    field_label       VARCHAR(100) NOT NULL,
    field_label_ar    VARCHAR(100),
    field_type        VARCHAR(50) NOT NULL, -- text, number, date, dropdown, email, phone, textarea, boolean, currency
    sort_order        INTEGER DEFAULT 0,
    is_system         BOOLEAN DEFAULT false,
    is_active         BOOLEAN DEFAULT true,
    UNIQUE(page_id, field_code)
);

-- =============================================================================
-- PERMISSIONS MATRIX (The Core Security Engine)
-- =============================================================================
CREATE TABLE permissions (
    permission_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id         UUID NOT NULL REFERENCES tenants(tenant_id),
    user_group_id     UUID NOT NULL REFERENCES user_groups(user_group_id),
    module_id         UUID REFERENCES modules(module_id),
    sub_module_id     UUID REFERENCES sub_modules(sub_module_id),
    page_id           UUID REFERENCES pages(page_id),
    field_id          UUID REFERENCES fields(field_id),
    permission_level  VARCHAR(10) NOT NULL DEFAULT 'NA', -- FA, VO, HI, NA, MA
    -- FA = Full Access, VO = View Only, HI = Hidden, NA = No Access, MA = Mandatory
    created_by        UUID REFERENCES users(user_id),
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, user_group_id, module_id, sub_module_id, page_id, field_id)
);

-- =============================================================================
-- MASTER CATEGORIES
-- =============================================================================
CREATE TABLE master_categories (
    category_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_code     VARCHAR(50) UNIQUE NOT NULL,
    category_name     VARCHAR(100) NOT NULL,
    category_name_ar  VARCHAR(100),
    module_id         UUID REFERENCES modules(module_id),
    is_global         BOOLEAN DEFAULT false, -- global = shared across all tenants
    description       TEXT,
    sort_order        INTEGER DEFAULT 0,
    is_active         BOOLEAN DEFAULT true,
    created_at        TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- MASTER VALUES
-- =============================================================================
CREATE TABLE master_values (
    value_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id       UUID NOT NULL REFERENCES master_categories(category_id),
    tenant_id         UUID REFERENCES tenants(tenant_id), -- NULL = global value
    value_code        VARCHAR(100) NOT NULL,
    value_label       VARCHAR(200) NOT NULL,
    value_label_ar    VARCHAR(200),
    description       TEXT,
    color_code        VARCHAR(7),  -- hex color for badges e.g. #52c41a
    icon_code         VARCHAR(50), -- icon name
    sort_order        INTEGER DEFAULT 0,
    is_default        BOOLEAN DEFAULT false,
    is_system         BOOLEAN DEFAULT false, -- system values cannot be deleted
    parent_value_id   UUID REFERENCES master_values(value_id),
    metadata          JSONB DEFAULT '{}',
    is_active         BOOLEAN DEFAULT true,
    created_by        UUID REFERENCES users(user_id),
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(category_id, tenant_id, value_code)
);

-- =============================================================================
-- USER SESSIONS (Refresh Tokens)
-- =============================================================================
CREATE TABLE user_sessions (
    session_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(user_id),
    tenant_id         UUID NOT NULL REFERENCES tenants(tenant_id),
    refresh_token_hash TEXT NOT NULL,
    ip_address        VARCHAR(50),
    user_agent        TEXT,
    expires_at        TIMESTAMP NOT NULL,
    is_revoked        BOOLEAN DEFAULT false,
    created_at        TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_tenant_group ON users(tenant_id, user_group_id);
CREATE INDEX idx_user_groups_tenant ON user_groups(tenant_id);
CREATE INDEX idx_permissions_tenant_group ON permissions(tenant_id, user_group_id);
CREATE INDEX idx_permissions_module ON permissions(module_id);
CREATE INDEX idx_permissions_page ON permissions(page_id);
CREATE INDEX idx_master_values_category ON master_values(category_id);
CREATE INDEX idx_master_values_tenant ON master_values(tenant_id);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token_hash);

-- =============================================================================
-- SEED: MODULES
-- =============================================================================
INSERT INTO modules (module_code, module_name, module_name_ar, module_icon, module_color, sort_order, is_core) VALUES
('core',         'Core Platform',          'النظام الأساسي',      'SettingOutlined',      '#722ed1', 0,  true),
('contacts',     'Contacts & Accounts',    'جهات الاتصال والحسابات','TeamOutlined',        '#1890ff', 1,  false),
('leads',        'Leads & Pipeline',       'العملاء المحتملون',    'FunnelPlotOutlined',   '#13c2c2', 2,  false),
('sales',        'Sales & Opportunities',  'المبيعات والفرص',      'RiseOutlined',         '#52c41a', 3,  false),
('activities',   'Activities & Calendar',  'الأنشطة والتقويم',     'CalendarOutlined',     '#fa8c16', 4,  false),
('support',      'Customer Support',       'دعم العملاء',          'CustomerServiceOutlined','f5222d', 5,  false),
('marketing',    'Marketing Campaigns',    'حملات التسويق',        'NotificationOutlined', '#eb2f96', 6,  false),
('reports',      'Reports & Analytics',    'التقارير والتحليلات',  'BarChartOutlined',     '#faad14', 7,  false),
('documents',    'Document Management',    'إدارة المستندات',      'FolderOutlined',       '#8c8c8c', 8,  false),
('integrations', 'Integration Hub',        'مركز التكامل',         'ApiOutlined',          '#2f54eb', 9,  false);

-- =============================================================================
-- SEED: SUB MODULES
-- =============================================================================
-- Core sub modules
INSERT INTO sub_modules (module_id, sub_module_code, sub_module_name, sort_order)
SELECT m.module_id, s.code, s.name, s.sort
FROM modules m
JOIN (VALUES
    ('core', 'user_management',   'User Management',   1),
    ('core', 'roles_permissions', 'Roles & Permissions', 2),
    ('core', 'master_data',       'Master Data',       3),
    ('core', 'tenant_settings',   'Tenant Settings',   4),
    ('core', 'audit_trail',       'Audit Trail',       5)
) AS s(module_code, code, name, sort) ON m.module_code = s.module_code;

-- Contacts sub modules
INSERT INTO sub_modules (module_id, sub_module_code, sub_module_name, sort_order)
SELECT m.module_id, s.code, s.name, s.sort
FROM modules m
JOIN (VALUES
    ('contacts', 'accounts', 'Accounts', 1),
    ('contacts', 'contacts', 'Contacts', 2)
) AS s(module_code, code, name, sort) ON m.module_code = s.module_code;

-- Leads sub modules
INSERT INTO sub_modules (module_id, sub_module_code, sub_module_name, sort_order)
SELECT m.module_id, s.code, s.name, s.sort
FROM modules m
JOIN (VALUES
    ('leads', 'leads_list',     'Leads List',     1),
    ('leads', 'leads_pipeline', 'Pipeline View',  2),
    ('leads', 'lead_sources',   'Lead Sources',   3)
) AS s(module_code, code, name, sort) ON m.module_code = s.module_code;

-- Sales sub modules
INSERT INTO sub_modules (module_id, sub_module_code, sub_module_name, sort_order)
SELECT m.module_id, s.code, s.name, s.sort
FROM modules m
JOIN (VALUES
    ('sales', 'opportunities', 'Opportunities', 1),
    ('sales', 'products',      'Products',      2),
    ('sales', 'forecasting',   'Forecasting',   3)
) AS s(module_code, code, name, sort) ON m.module_code = s.module_code;

-- =============================================================================
-- SEED: MASTER CATEGORIES
-- =============================================================================
INSERT INTO master_categories (category_code, category_name, category_name_ar, is_global, sort_order) VALUES
-- Geographic
('countries',           'Countries',              'الدول',                  true, 1),
('currencies',          'Currencies',             'العملات',                true, 2),
('timezones',           'Timezones',              'المناطق الزمنية',        true, 3),
('languages',           'Languages',              'اللغات',                 true, 4),
-- CRM Core
('lead_sources',        'Lead Sources',           'مصادر العملاء المحتملين', false, 10),
('lead_statuses',       'Lead Statuses',          'حالات العملاء المحتملين', false, 11),
('opportunity_stages',  'Opportunity Stages',     'مراحل الفرص',            false, 12),
('lost_reasons',        'Lost Reasons',           'أسباب الخسارة',          false, 13),
('contact_roles',       'Contact Roles',          'أدوار جهات الاتصال',     false, 14),
('account_types',       'Account Types',          'أنواع الحسابات',         false, 15),
('account_industries',  'Account Industries',     'قطاعات الحسابات',        false, 16),
('activity_types',      'Activity Types',         'أنواع الأنشطة',          false, 17),
('activity_outcomes',   'Activity Outcomes',      'نتائج الأنشطة',          false, 18),
-- Support
('ticket_categories',   'Ticket Categories',      'فئات التذاكر',           false, 20),
('ticket_priorities',   'Ticket Priorities',      'أولويات التذاكر',        false, 21),
('ticket_statuses',     'Ticket Statuses',        'حالات التذاكر',          false, 22),
('sla_types',           'SLA Types',              'أنواع اتفاقيات الخدمة',  false, 23),
('resolution_types',    'Resolution Types',       'أنواع الحلول',           false, 24),
-- Marketing
('campaign_types',      'Campaign Types',         'أنواع الحملات',          false, 30),
('campaign_statuses',   'Campaign Statuses',      'حالات الحملات',          false, 31),
-- System
('user_titles',         'User Titles',            'ألقاب المستخدمين',       true,  40),
('document_types',      'Document Types',         'أنواع المستندات',        false, 41),
('note_types',          'Note Types',             'أنواع الملاحظات',        false, 42),
('tags',                'Tags',                   'العلامات',               false, 43);

-- =============================================================================
-- SEED: GLOBAL MASTER VALUES
-- =============================================================================
-- User Titles
INSERT INTO master_values (category_id, value_code, value_label, value_label_ar, sort_order, is_system)
SELECT c.category_id, v.code, v.label, v.label_ar, v.sort, true
FROM master_categories c
JOIN (VALUES
    ('user_titles', 'MR',   'Mr.',   'السيد',    1),
    ('user_titles', 'MS',   'Ms.',   'السيدة',   2),
    ('user_titles', 'MRS',  'Mrs.',  'السيدة',   3),
    ('user_titles', 'DR',   'Dr.',   'دكتور',    4),
    ('user_titles', 'ENG',  'Eng.',  'مهندس',    5),
    ('user_titles', 'PROF', 'Prof.', 'أستاذ',    6)
) AS v(cat_code, code, label, label_ar, sort) ON c.category_code = v.cat_code;

-- Lead Sources (global defaults)
INSERT INTO master_values (category_id, value_code, value_label, value_label_ar, color_code, sort_order, is_system)
SELECT c.category_id, v.code, v.label, v.label_ar, v.color, v.sort, true
FROM master_categories c
JOIN (VALUES
    ('lead_sources', 'WEBSITE',     'Website',        'الموقع الإلكتروني', '#1890ff', 1),
    ('lead_sources', 'REFERRAL',    'Referral',       'إحالة',              '#52c41a', 2),
    ('lead_sources', 'COLD_CALL',   'Cold Call',      'مكالمة باردة',       '#fa8c16', 3),
    ('lead_sources', 'TRADE_SHOW',  'Trade Show',     'معرض تجاري',         '#722ed1', 4),
    ('lead_sources', 'SOCIAL_MEDIA','Social Media',   'وسائل التواصل',      '#eb2f96', 5),
    ('lead_sources', 'EMAIL',       'Email Campaign', 'حملة بريد إلكتروني', '#13c2c2', 6),
    ('lead_sources', 'PARTNER',     'Partner',        'شريك',               '#faad14', 7),
    ('lead_sources', 'OTHER',       'Other',          'أخرى',               '#8c8c8c', 8)
) AS v(cat_code, code, label, label_ar, color, sort) ON c.category_code = v.cat_code;

-- Lead Statuses
INSERT INTO master_values (category_id, value_code, value_label, value_label_ar, color_code, sort_order, is_system, is_default)
SELECT c.category_id, v.code, v.label, v.label_ar, v.color, v.sort, true, v.is_def
FROM master_categories c
JOIN (VALUES
    ('lead_statuses', 'NEW',          'New',           'جديد',         '#1890ff', 1, true),
    ('lead_statuses', 'CONTACTED',    'Contacted',     'تم التواصل',   '#13c2c2', 2, false),
    ('lead_statuses', 'QUALIFIED',    'Qualified',     'مؤهل',         '#52c41a', 3, false),
    ('lead_statuses', 'PROPOSAL',     'Proposal Sent', 'تم إرسال العرض','#fa8c16',4, false),
    ('lead_statuses', 'DISQUALIFIED', 'Disqualified',  'غير مؤهل',     '#ff4d4f', 5, false),
    ('lead_statuses', 'CONVERTED',    'Converted',     'محوّل',         '#722ed1', 6, false)
) AS v(cat_code, code, label, label_ar, color, sort, is_def) ON c.category_code = v.cat_code;

-- Opportunity Stages
INSERT INTO master_values (category_id, value_code, value_label, value_label_ar, color_code, sort_order, is_system, is_default)
SELECT c.category_id, v.code, v.label, v.label_ar, v.color, v.sort, true, v.is_def
FROM master_categories c
JOIN (VALUES
    ('opportunity_stages', 'PROSPECTING',  'Prospecting',    'الاستكشاف',      '#1890ff', 1, true),
    ('opportunity_stages', 'QUALIFICATION','Qualification',  'التأهيل',        '#13c2c2', 2, false),
    ('opportunity_stages', 'PROPOSAL',     'Proposal',       'العرض',          '#fa8c16', 3, false),
    ('opportunity_stages', 'NEGOTIATION',  'Negotiation',    'التفاوض',        '#722ed1', 4, false),
    ('opportunity_stages', 'CLOSED_WON',   'Closed Won',     'مغلق - فوز',     '#52c41a', 5, false),
    ('opportunity_stages', 'CLOSED_LOST',  'Closed Lost',    'مغلق - خسارة',   '#ff4d4f', 6, false)
) AS v(cat_code, code, label, label_ar, color, sort, is_def) ON c.category_code = v.cat_code;

-- Account Types
INSERT INTO master_values (category_id, value_code, value_label, value_label_ar, sort_order, is_system)
SELECT c.category_id, v.code, v.label, v.label_ar, v.sort, true
FROM master_categories c
JOIN (VALUES
    ('account_types', 'CUSTOMER',   'Customer',   'عميل',          1),
    ('account_types', 'PROSPECT',   'Prospect',   'عميل محتمل',    2),
    ('account_types', 'PARTNER',    'Partner',    'شريك',          3),
    ('account_types', 'RESELLER',   'Reseller',   'موزع',          4),
    ('account_types', 'COMPETITOR', 'Competitor', 'منافس',         5),
    ('account_types', 'OTHER',      'Other',      'أخرى',          6)
) AS v(cat_code, code, label, label_ar, sort) ON c.category_code = v.cat_code;

-- Activity Types
INSERT INTO master_values (category_id, value_code, value_label, value_label_ar, color_code, icon_code, sort_order, is_system)
SELECT c.category_id, v.code, v.label, v.label_ar, v.color, v.icon, v.sort, true
FROM master_categories c
JOIN (VALUES
    ('activity_types', 'CALL',     'Call',     'مكالمة',      '#1890ff', 'PhoneOutlined',    1),
    ('activity_types', 'EMAIL',    'Email',    'بريد إلكتروني','#52c41a', 'MailOutlined',     2),
    ('activity_types', 'MEETING',  'Meeting',  'اجتماع',      '#722ed1', 'TeamOutlined',     3),
    ('activity_types', 'DEMO',     'Demo',     'عرض تجريبي',  '#fa8c16', 'PlayCircleOutlined',4),
    ('activity_types', 'TASK',     'Task',     'مهمة',        '#13c2c2', 'CheckCircleOutlined',5),
    ('activity_types', 'FOLLOWUP', 'Follow Up','متابعة',      '#eb2f96', 'SyncOutlined',     6)
) AS v(cat_code, code, label, label_ar, color, icon, sort) ON c.category_code = v.cat_code;

-- Ticket Priorities
INSERT INTO master_values (category_id, value_code, value_label, value_label_ar, color_code, sort_order, is_system)
SELECT c.category_id, v.code, v.label, v.label_ar, v.color, v.sort, true
FROM master_categories c
JOIN (VALUES
    ('ticket_priorities', 'CRITICAL', 'Critical', 'حرج',   '#ff4d4f', 1),
    ('ticket_priorities', 'HIGH',     'High',     'عالي',  '#fa8c16', 2),
    ('ticket_priorities', 'MEDIUM',   'Medium',   'متوسط', '#faad14', 3),
    ('ticket_priorities', 'LOW',      'Low',      'منخفض', '#52c41a', 4)
) AS v(cat_code, code, label, label_ar, color, sort) ON c.category_code = v.cat_code;

-- Ticket Statuses
INSERT INTO master_values (category_id, value_code, value_label, value_label_ar, color_code, sort_order, is_system, is_default)
SELECT c.category_id, v.code, v.label, v.label_ar, v.color, v.sort, true, v.is_def
FROM master_categories c
JOIN (VALUES
    ('ticket_statuses', 'OPEN',             'Open',              'مفتوح',             '#1890ff', 1, true),
    ('ticket_statuses', 'IN_PROGRESS',      'In Progress',       'قيد التنفيذ',       '#fa8c16', 2, false),
    ('ticket_statuses', 'PENDING_CUSTOMER', 'Pending Customer',  'في انتظار العميل',  '#faad14', 3, false),
    ('ticket_statuses', 'RESOLVED',         'Resolved',          'محلول',             '#52c41a', 4, false),
    ('ticket_statuses', 'CLOSED',           'Closed',            'مغلق',              '#8c8c8c', 5, false)
) AS v(cat_code, code, label, label_ar, color, sort, is_def) ON c.category_code = v.cat_code;

-- =============================================================================
-- SEED: DEFAULT SYSTEM TENANT
-- =============================================================================
INSERT INTO tenants (tenant_code, company_name, subscription_plan, is_active)
VALUES ('SYSTEM', 'System Administration', 'ENTERPRISE', true);

-- =============================================================================
-- TRIGGER: updated_at auto-update
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_groups_updated_at BEFORE UPDATE ON user_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_master_values_updated_at BEFORE UPDATE ON master_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
