-- =============================================================================
-- PHASE 1 MODULE DATABASES
-- Run this after init-db.sql
-- =============================================================================

-- Create separate databases for each module
CREATE DATABASE crm_contacts;
CREATE DATABASE crm_leads;
CREATE DATABASE crm_sales;
CREATE DATABASE crm_activities;

-- Connect to contacts DB
\c crm_contacts;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CONTACTS MODULE
-- =============================================================================

CREATE TABLE accounts (
    account_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    account_name        VARCHAR(200) NOT NULL,
    account_type_id     UUID,           -- FK → master_values
    industry_id         UUID,
    website             VARCHAR(300),
    phone               VARCHAR(50),
    email               VARCHAR(255),
    address_line1       VARCHAR(300),
    address_line2       VARCHAR(300),
    city                VARCHAR(100),
    state               VARCHAR(100),
    country_id          UUID,
    postal_code         VARCHAR(20),
    annual_revenue      DECIMAL(18,2),
    employee_count      INTEGER,
    parent_account_id   UUID REFERENCES accounts(account_id),
    assigned_to         UUID,
    description         TEXT,
    tags                TEXT[],
    custom_fields       JSONB DEFAULT '{}',
    is_active           BOOLEAN DEFAULT true,
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contacts (
    contact_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    account_id          UUID REFERENCES accounts(account_id),
    title_id            UUID,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    job_title           VARCHAR(150),
    department          VARCHAR(150),
    email               VARCHAR(255),
    email_secondary     VARCHAR(255),
    phone               VARCHAR(50),
    mobile              VARCHAR(50),
    contact_role_id     UUID,
    date_of_birth       DATE,
    linkedin_url        VARCHAR(300),
    twitter_handle      VARCHAR(100),
    assigned_to         UUID,
    description         TEXT,
    tags                TEXT[],
    custom_fields       JSONB DEFAULT '{}',
    is_primary          BOOLEAN DEFAULT false,
    do_not_contact      BOOLEAN DEFAULT false,
    do_not_email        BOOLEAN DEFAULT false,
    is_active           BOOLEAN DEFAULT true,
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contact_account_links (
    link_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id          UUID NOT NULL REFERENCES contacts(contact_id),
    account_id          UUID NOT NULL REFERENCES accounts(account_id),
    role_id             UUID,
    is_primary          BOOLEAN DEFAULT false,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account_notes (
    note_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    account_id          UUID REFERENCES accounts(account_id),
    contact_id          UUID REFERENCES contacts(contact_id),
    note_type_id        UUID,
    note_text           TEXT NOT NULL,
    is_pinned           BOOLEAN DEFAULT false,
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accounts_tenant ON accounts(tenant_id);
CREATE INDEX idx_accounts_name ON accounts USING gin(to_tsvector('english', account_name));
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE INDEX idx_contacts_email ON contacts(email);

-- =============================================================================
-- LEADS MODULE
-- =============================================================================
\c crm_leads;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE leads (
    lead_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    lead_number         VARCHAR(20),          -- AUTO: LEAD-2024-00001
    title_id            UUID,
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    company_name        VARCHAR(200),
    job_title           VARCHAR(150),
    email               VARCHAR(255),
    phone               VARCHAR(50),
    mobile              VARCHAR(50),
    lead_source_id      UUID,
    lead_status_id      UUID,
    industry_id         UUID,
    country_id          UUID,
    city                VARCHAR(100),
    website             VARCHAR(300),
    estimated_value     DECIMAL(18,2),
    description         TEXT,
    lead_score          INTEGER DEFAULT 0,
    assigned_to         UUID,
    tags                TEXT[],
    custom_fields       JSONB DEFAULT '{}',
    converted           BOOLEAN DEFAULT false,
    converted_at        TIMESTAMP,
    converted_account_id UUID,
    converted_contact_id UUID,
    converted_opportunity_id UUID,
    is_active           BOOLEAN DEFAULT true,
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lead_activities (
    activity_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id             UUID NOT NULL REFERENCES leads(lead_id),
    activity_type_id    UUID,
    subject             VARCHAR(300),
    description         TEXT,
    outcome_id          UUID,
    due_date            TIMESTAMP,
    completed_date      TIMESTAMP,
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lead_score_rules (
    rule_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    rule_name           VARCHAR(200),
    field_name          VARCHAR(100),
    condition           VARCHAR(50),          -- equals, contains, greater_than
    value               VARCHAR(200),
    score_points        INTEGER,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE lead_number_seq START 1;
CREATE INDEX idx_leads_tenant ON leads(tenant_id);
CREATE INDEX idx_leads_status ON leads(lead_status_id);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);

-- =============================================================================
-- SALES MODULE
-- =============================================================================
\c crm_sales;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE opportunities (
    opportunity_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    opportunity_number  VARCHAR(20),          -- AUTO: OPP-2024-00001
    opportunity_name    VARCHAR(300) NOT NULL,
    account_id          UUID,
    contact_id          UUID,
    lead_id             UUID,
    stage_id            UUID NOT NULL,
    deal_value          DECIMAL(18,2),
    currency_code       VARCHAR(3) DEFAULT 'OMR',
    probability         INTEGER DEFAULT 0,    -- 0-100
    expected_close      DATE,
    actual_close        DATE,
    lost_reason_id      UUID,
    competitor          VARCHAR(200),
    description         TEXT,
    next_step           TEXT,
    assigned_to         UUID,
    tags                TEXT[],
    custom_fields       JSONB DEFAULT '{}',
    is_active           BOOLEAN DEFAULT true,
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE opportunity_products (
    op_product_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id      UUID NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    product_name        VARCHAR(200) NOT NULL,
    product_code        VARCHAR(100),
    quantity            DECIMAL(10,2) DEFAULT 1,
    unit_price          DECIMAL(18,2),
    discount_pct        DECIMAL(5,2) DEFAULT 0,
    total_price         DECIMAL(18,2),
    notes               TEXT,
    sort_order          INTEGER DEFAULT 0
);

CREATE TABLE opportunity_stage_history (
    history_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id      UUID NOT NULL REFERENCES opportunities(opportunity_id),
    from_stage_id       UUID,
    to_stage_id         UUID NOT NULL,
    changed_by          UUID,
    changed_at          TIMESTAMP DEFAULT NOW(),
    notes               TEXT
);

CREATE TABLE sales_quotas (
    quota_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    user_id             UUID NOT NULL,
    period_type         VARCHAR(20),          -- MONTHLY, QUARTERLY, YEARLY
    period_year         INTEGER,
    period_number       INTEGER,              -- month 1-12, quarter 1-4
    quota_value         DECIMAL(18,2),
    currency_code       VARCHAR(3) DEFAULT 'OMR',
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE opp_number_seq START 1;
CREATE INDEX idx_opp_tenant ON opportunities(tenant_id);
CREATE INDEX idx_opp_stage ON opportunities(stage_id);
CREATE INDEX idx_opp_account ON opportunities(account_id);
CREATE INDEX idx_opp_assigned ON opportunities(assigned_to);
CREATE INDEX idx_opp_close_date ON opportunities(expected_close);

-- =============================================================================
-- ACTIVITIES MODULE
-- =============================================================================
\c crm_activities;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE activities (
    activity_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    activity_type_id    UUID NOT NULL,
    subject             VARCHAR(300) NOT NULL,
    description         TEXT,
    status              VARCHAR(20) DEFAULT 'PLANNED',  -- PLANNED, COMPLETED, CANCELLED
    outcome_id          UUID,
    priority            VARCHAR(10) DEFAULT 'MEDIUM',   -- LOW, MEDIUM, HIGH
    due_date            TIMESTAMP,
    start_date          TIMESTAMP,
    completed_date      TIMESTAMP,
    duration_minutes    INTEGER,
    location            VARCHAR(300),
    related_to_type     VARCHAR(50),  -- LEAD, CONTACT, ACCOUNT, OPPORTUNITY
    related_to_id       UUID,
    related_to_name     VARCHAR(300),
    assigned_to         UUID,
    is_private          BOOLEAN DEFAULT false,
    reminder_minutes    INTEGER,      -- minutes before due_date to send reminder
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activity_attendees (
    attendee_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id         UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    contact_id          UUID,
    user_id             UUID,
    email               VARCHAR(255),
    full_name           VARCHAR(200),
    attendance_status   VARCHAR(20) DEFAULT 'INVITED',  -- INVITED, ACCEPTED, DECLINED, TENTATIVE
    responded_at        TIMESTAMP
);

CREATE TABLE activity_reminders (
    reminder_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id         UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    user_id             UUID NOT NULL,
    remind_at           TIMESTAMP NOT NULL,
    is_sent             BOOLEAN DEFAULT false,
    sent_at             TIMESTAMP
);

CREATE INDEX idx_activities_tenant ON activities(tenant_id);
CREATE INDEX idx_activities_assigned ON activities(assigned_to);
CREATE INDEX idx_activities_due ON activities(due_date);
CREATE INDEX idx_activities_related ON activities(related_to_type, related_to_id);
CREATE INDEX idx_activities_status ON activities(status);
