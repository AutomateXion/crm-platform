-- =============================================================================
-- PHASE 2 MODULE DATABASES
-- =============================================================================
CREATE DATABASE crm_support;
CREATE DATABASE crm_marketing;
CREATE DATABASE crm_reports;
CREATE DATABASE crm_documents;

\c crm_support;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE support_teams (
    team_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    team_name       VARCHAR(100) NOT NULL,
    team_name_ar    VARCHAR(100),
    email           VARCHAR(255),
    description     TEXT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets (
    ticket_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    ticket_number       VARCHAR(20) UNIQUE NOT NULL,
    subject             VARCHAR(300) NOT NULL,
    description         TEXT,
    account_id          UUID,
    contact_id          UUID,
    category_id         UUID,
    priority_id         UUID NOT NULL,
    status_id           UUID NOT NULL,
    sla_type_id         UUID,
    sla_due_at          TIMESTAMP,
    sla_breached        BOOLEAN DEFAULT false,
    first_response_at   TIMESTAMP,
    resolved_at         TIMESTAMP,
    closed_at           TIMESTAMP,
    assigned_to         UUID,
    assigned_team_id    UUID REFERENCES support_teams(team_id),
    resolution          TEXT,
    resolution_type_id  UUID,
    satisfaction_score  INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
    satisfaction_note   TEXT,
    tags                TEXT[],
    custom_fields       JSONB DEFAULT '{}',
    is_active           BOOLEAN DEFAULT true,
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_comments (
    comment_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id       UUID NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    comment_text    TEXT NOT NULL,
    is_internal     BOOLEAN DEFAULT false,
    attachments     JSONB DEFAULT '[]',
    created_by      UUID,
    created_by_name VARCHAR(200),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_history (
    history_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id       UUID NOT NULL REFERENCES tickets(ticket_id),
    field_changed   VARCHAR(100),
    old_value       TEXT,
    new_value       TEXT,
    changed_by      UUID,
    changed_by_name VARCHAR(200),
    changed_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE canned_responses (
    response_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    title           VARCHAR(200) NOT NULL,
    body            TEXT NOT NULL,
    category_id     UUID,
    is_active       BOOLEAN DEFAULT true,
    created_by      UUID,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_tenant    ON tickets(tenant_id);
CREATE INDEX idx_tickets_status    ON tickets(status_id);
CREATE INDEX idx_tickets_assigned  ON tickets(assigned_to);
CREATE INDEX idx_tickets_account   ON tickets(account_id);
CREATE INDEX idx_comments_ticket   ON ticket_comments(ticket_id);

-- =============================================================================
\c crm_marketing;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE campaigns (
    campaign_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    campaign_number     VARCHAR(20),
    campaign_name       VARCHAR(200) NOT NULL,
    campaign_type_id    UUID,
    status_id           UUID,
    start_date          DATE,
    end_date            DATE,
    budget              DECIMAL(18,2),
    actual_spend        DECIMAL(18,2) DEFAULT 0,
    target_audience     TEXT,
    description         TEXT,
    subject_line        VARCHAR(300),
    from_name           VARCHAR(200),
    from_email          VARCHAR(255),
    expected_leads      INTEGER DEFAULT 0,
    actual_leads        INTEGER DEFAULT 0,
    tags                TEXT[],
    custom_fields       JSONB DEFAULT '{}',
    is_active           BOOLEAN DEFAULT true,
    created_by          UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campaign_members (
    member_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    contact_id      UUID,
    lead_id         UUID,
    email           VARCHAR(255),
    full_name       VARCHAR(200),
    status          VARCHAR(50) DEFAULT 'PENDING',
    sent_at         TIMESTAMP,
    opened_at       TIMESTAMP,
    clicked_at      TIMESTAMP,
    responded_at    TIMESTAMP,
    converted       BOOLEAN DEFAULT false,
    converted_at    TIMESTAMP,
    open_count      INTEGER DEFAULT 0,
    click_count     INTEGER DEFAULT 0
);

CREATE INDEX idx_campaigns_tenant  ON campaigns(tenant_id);
CREATE INDEX idx_members_campaign  ON campaign_members(campaign_id);

-- =============================================================================
\c crm_reports;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE saved_reports (
    report_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    report_name     VARCHAR(200) NOT NULL,
    module_code     VARCHAR(50),
    report_type     VARCHAR(50),
    description     TEXT,
    filters         JSONB DEFAULT '{}',
    columns_config  JSONB DEFAULT '[]',
    grouping        JSONB DEFAULT '{}',
    sorting         JSONB DEFAULT '{}',
    chart_config    JSONB DEFAULT '{}',
    is_shared       BOOLEAN DEFAULT false,
    is_system       BOOLEAN DEFAULT false,
    run_count       INTEGER DEFAULT 0,
    last_run_at     TIMESTAMP,
    created_by      UUID,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dashboards (
    dashboard_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    dashboard_name  VARCHAR(200) NOT NULL,
    description     TEXT,
    layout          JSONB DEFAULT '[]',
    is_default      BOOLEAN DEFAULT false,
    is_shared       BOOLEAN DEFAULT false,
    created_by      UUID,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dashboard_widgets (
    widget_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id    UUID NOT NULL REFERENCES dashboards(dashboard_id) ON DELETE CASCADE,
    report_id       UUID REFERENCES saved_reports(report_id),
    widget_type     VARCHAR(50),
    widget_title    VARCHAR(200),
    config          JSONB DEFAULT '{}',
    position_x      INTEGER DEFAULT 0,
    position_y      INTEGER DEFAULT 0,
    width           INTEGER DEFAULT 6,
    height          INTEGER DEFAULT 4,
    sort_order      INTEGER DEFAULT 0
);

CREATE TABLE report_schedules (
    schedule_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    report_id       UUID NOT NULL REFERENCES saved_reports(report_id),
    frequency       VARCHAR(20),
    day_of_week     INTEGER,
    day_of_month    INTEGER,
    send_time       TIME,
    recipients      TEXT[],
    format          VARCHAR(10) DEFAULT 'PDF',
    is_active       BOOLEAN DEFAULT true,
    last_sent_at    TIMESTAMP,
    created_by      UUID,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_tenant    ON saved_reports(tenant_id);
CREATE INDEX idx_dashboards_tenant ON dashboards(tenant_id);

-- =============================================================================
\c crm_documents;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE documents (
    document_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL,
    document_name       VARCHAR(300) NOT NULL,
    document_type_id    UUID,
    file_name           VARCHAR(300),
    file_size           BIGINT,
    mime_type           VARCHAR(100),
    storage_key         VARCHAR(500),
    storage_bucket      VARCHAR(200),
    version             INTEGER DEFAULT 1,
    parent_document_id  UUID REFERENCES documents(document_id),
    related_to_type     VARCHAR(50),
    related_to_id       UUID,
    related_to_name     VARCHAR(300),
    description         TEXT,
    tags                TEXT[],
    expiry_date         DATE,
    is_confidential     BOOLEAN DEFAULT false,
    download_count      INTEGER DEFAULT 0,
    last_accessed_at    TIMESTAMP,
    is_active           BOOLEAN DEFAULT true,
    uploaded_by         UUID,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_shares (
    share_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id     UUID NOT NULL REFERENCES documents(document_id),
    share_token     VARCHAR(100) UNIQUE,
    shared_with     VARCHAR(255),
    expires_at      TIMESTAMP,
    access_count    INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    created_by      UUID,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_tenant  ON documents(tenant_id);
CREATE INDEX idx_documents_related ON documents(related_to_type, related_to_id);
CREATE INDEX idx_documents_expiry  ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
