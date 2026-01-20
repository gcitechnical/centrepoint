# Church Centrepoint - Technical Specification (MVP)

**Version:** 1.0  
**Date:** January 20, 2026  
**Author:** Solutions Architecture Team

---

## Executive Summary

Church Centrepoint is a multi-tenant Church Management SaaS platform designed to provide comprehensive ERP capabilities while ensuring brand consistency across organizational hierarchies. This document outlines the technical architecture, database design, and implementation details for the MVP.

---

## 1. SaaS Architecture & Technology Stack

### 1.1 Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | SSR, excellent DX, React ecosystem |
| **Backend** | NestJS (Node.js) | TypeScript, modular architecture, enterprise patterns |
| **Database** | PostgreSQL 15+ | JSONB support, RLS, mature ecosystem |
| **Cache** | Redis | Session management, real-time features |
| **Storage** | AWS S3 / Cloudflare R2 | Template assets, user designs, exports |
| **Queue** | BullMQ (Redis-backed) | PDF generation, email notifications |

### 1.2 Multi-Tenancy Strategy Analysis

#### Option A: Row-Level Security (TenantID Column)

```sql
-- Every table includes tenant_id
CREATE TABLE members (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    first_name VARCHAR(100),
    ...
);

-- PostgreSQL RLS Policy
CREATE POLICY tenant_isolation ON members
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

**Pros:**
- Single database instance, lower infrastructure costs
- Simpler backup/restore procedures
- Easier cross-tenant analytics (for platform admin)
- Scales well to hundreds of tenants

**Cons:**
- Risk of data leakage if RLS misconfigured
- All tenants share database resources
- Complex migrations affect all tenants

#### Option B: Schema-Per-Tenant

```sql
-- Each tenant gets their own schema
CREATE SCHEMA tenant_gci;
CREATE TABLE tenant_gci.members (...);
```

**Pros:**
- Complete data isolation
- Per-tenant backup/restore
- Independent schema migrations possible

**Cons:**
- Connection pooling complexity
- Higher operational overhead at scale
- Difficult cross-tenant reporting

### 1.3 Recommendation: **Hybrid Approach**

For Church Centrepoint scaling to hundreds of tenants:

```
┌─────────────────────────────────────────────────────────┐
│                    RECOMMENDED APPROACH                  │
├─────────────────────────────────────────────────────────┤
│  PRIMARY: Row-Level Security (RLS) with tenant_id       │
│  ENHANCEMENT: Logical sharding by tenant tier           │
│                                                         │
│  - Free/Basic Tiers → Shared Database Pool              │
│  - Enterprise Tiers → Dedicated Database Instance       │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**
1. Use RLS for all standard tenants (cost-effective)
2. Offer dedicated database as Enterprise upsell
3. Abstract data access layer to support both modes

---

## 2. Database Schema (ERD)

### 2.1 Core Organizational Hierarchy

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   TENANTS    │────<│   BRANCHES   │────<│  MINISTRIES  │
│  (HQ Level)  │     │ (Local Sites)│     │ (Departments)│
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       └────────────────────┴────────────────────┘
                           │
                    ┌──────┴──────┐
                    │   MEMBERS   │
                    │  (People)   │
                    └─────────────┘
```

### 2.2 Schema Definitions

```sql
-- =============================================
-- TENANT & ORGANIZATIONAL STRUCTURE
-- =============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    
    -- Brand Standards (enforced globally)
    brand_config JSONB DEFAULT '{
        "primary_color": "#1a365d",
        "secondary_color": "#ed8936",
        "fonts": {"heading": "Inter", "body": "Open Sans"}
    }',
    
    -- Subscription & Licensing
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    feature_flags JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    
    -- Branch-specific settings (inherits from tenant)
    settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID, -- References members table
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CENTREPOINT STUDIO SCHEMA
-- =============================================

CREATE TABLE design_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    -- NULL tenant_id = Global template (platform-provided)
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'flyer', 'bulletin', 'social_media', 'banner'
    
    -- Template dimensions
    width INT NOT NULL,
    height INT NOT NULL,
    unit VARCHAR(10) DEFAULT 'px', -- 'px', 'mm', 'in'
    
    -- Fabric.js JSON Canvas Definition
    canvas_json JSONB NOT NULL,
    
    -- Thumbnail for browsing
    thumbnail_url TEXT,
    
    -- Template metadata
    is_active BOOLEAN DEFAULT true,
    is_master BOOLEAN DEFAULT false, -- HQ Master Templates
    
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient template queries
CREATE INDEX idx_templates_tenant ON design_templates(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_templates_global ON design_templates(id) WHERE tenant_id IS NULL;

CREATE TABLE user_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    
    -- Source template reference
    template_id UUID REFERENCES design_templates(id),
    
    -- Link to event (if auto-generated)
    event_id UUID, -- References events table
    
    name VARCHAR(255) NOT NULL,
    
    -- User's modified canvas state
    canvas_json JSONB NOT NULL,
    
    -- Export history
    exports JSONB DEFAULT '[]',
    
    -- Workflow status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'published'
    
    created_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EVENTS & CALENDAR
-- =============================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    ministry_id UUID REFERENCES ministries(id),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Event timing
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    is_all_day BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- iCal RRULE format
    
    -- Location
    venue_name VARCHAR(255),
    venue_address TEXT,
    is_online BOOLEAN DEFAULT false,
    online_url TEXT,
    
    -- Auto-flyer generation
    auto_generate_flyer BOOLEAN DEFAULT true,
    flyer_template_id UUID REFERENCES design_templates(id),
    generated_design_id UUID REFERENCES user_designs(id),
    
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Template Locking Mechanism (canvas_json Structure)

```json
{
  "version": "5.3.0",
  "objects": [
    {
      "type": "image",
      "id": "background_layer",
      "src": "https://cdn.centrepoint.app/templates/bg-001.jpg",
      "lockMovementX": true,
      "lockMovementY": true,
      "lockScalingX": true,
      "lockScalingY": true,
      "lockRotation": true,
      "selectable": false,
      "evented": false,
      "editable": false,
      "_cp_locked": true,
      "_cp_zone": "protected"
    },
    {
      "type": "image",
      "id": "church_logo",
      "src": "{{tenant.logo_url}}",
      "left": 50,
      "top": 50,
      "selectable": false,
      "evented": false,
      "_cp_locked": true,
      "_cp_zone": "protected"
    },
    {
      "type": "textbox",
      "id": "event_title",
      "text": "{{event.title}}",
      "left": 100,
      "top": 300,
      "width": 600,
      "fontSize": 48,
      "fontFamily": "{{tenant.brand_config.fonts.heading}}",
      "fill": "{{tenant.brand_config.primary_color}}",
      "selectable": true,
      "editable": true,
      "_cp_locked": false,
      "_cp_zone": "safe",
      "_cp_data_binding": "event.title",
      "_cp_constraints": {
        "maxLength": 50,
        "allowedFonts": ["Inter", "Montserrat"],
        "allowedColors": ["#1a365d", "#2d3748", "#ffffff"]
      }
    },
    {
      "type": "textbox",
      "id": "event_date",
      "text": "{{event.formatted_date}}",
      "selectable": true,
      "editable": true,
      "_cp_locked": false,
      "_cp_zone": "safe",
      "_cp_data_binding": "event.formatted_date"
    },
    {
      "type": "rect",
      "id": "image_placeholder",
      "fill": "#e2e8f0",
      "width": 400,
      "height": 300,
      "selectable": true,
      "_cp_locked": false,
      "_cp_zone": "safe",
      "_cp_type": "image_drop_zone"
    }
  ],
  "background": "#ffffff"
}
```

---

## 3. Centrepoint Studio Implementation (Fabric.js)

### 3.1 Template Locking Logic Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  TEMPLATE LOADING FLOW                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. FETCH TEMPLATE                                           │
│    GET /api/studio/templates/{id}                           │
│    Returns: canvas_json with _cp_* metadata                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PROCESS TEMPLATE ON CLIENT                               │
│    - Parse canvas_json                                      │
│    - Inject tenant brand values (colors, fonts, logo)       │
│    - Inject event data if applicable                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. APPLY LOCKING RULES                                      │
│    FOR each object in canvas:                               │
│      IF object._cp_locked === true:                         │
│        → Set selectable: false                              │
│        → Set evented: false                                 │
│        → Set hasControls: false                             │
│      ELSE IF object._cp_zone === 'safe':                    │
│        → Set selectable: true                               │
│        → Apply _cp_constraints as edit boundaries           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RENDER CANVAS                                            │
│    fabric.Canvas.loadFromJSON(processedTemplate)            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Frontend Implementation (React + Fabric.js)

```typescript
// lib/studio/CanvasManager.ts

import { fabric } from 'fabric';

interface CPObjectOptions {
  _cp_locked?: boolean;
  _cp_zone?: 'protected' | 'safe';
  _cp_data_binding?: string;
  _cp_constraints?: {
    maxLength?: number;
    allowedFonts?: string[];
    allowedColors?: string[];
  };
}

export class CanvasManager {
  private canvas: fabric.Canvas;
  private templateData: any;
  private eventData: any;
  private tenantConfig: any;

  constructor(canvasId: string) {
    this.canvas = new fabric.Canvas(canvasId, {
      preserveObjectStacking: true,
      selection: true,
    });
  }

  async loadTemplate(
    templateJson: any,
    eventData?: any,
    tenantConfig?: any
  ): Promise<void> {
    this.eventData = eventData;
    this.tenantConfig = tenantConfig;

    // Step 1: Process data bindings
    const processedJson = this.processDataBindings(templateJson);

    // Step 2: Load into Fabric.js
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(processedJson, () => {
        // Step 3: Apply locking rules after load
        this.applyLockingRules();
        this.canvas.renderAll();
        resolve();
      });
    });
  }

  private processDataBindings(templateJson: any): any {
    const jsonString = JSON.stringify(templateJson);
    
    // Replace template variables
    const processed = jsonString
      .replace(/\{\{event\.title\}\}/g, this.eventData?.title || 'Event Title')
      .replace(/\{\{event\.formatted_date\}\}/g, 
        this.formatEventDate(this.eventData?.start_datetime))
      .replace(/\{\{event\.venue\}\}/g, this.eventData?.venue_name || 'Venue')
      .replace(/\{\{tenant\.logo_url\}\}/g, this.tenantConfig?.logo_url || '')
      .replace(/\{\{tenant\.brand_config\.primary_color\}\}/g, 
        this.tenantConfig?.brand_config?.primary_color || '#1a365d')
      .replace(/\{\{tenant\.brand_config\.fonts\.heading\}\}/g,
        this.tenantConfig?.brand_config?.fonts?.heading || 'Inter');

    return JSON.parse(processed);
  }

  private applyLockingRules(): void {
    this.canvas.getObjects().forEach((obj: fabric.Object & CPObjectOptions) => {
      if (obj._cp_locked === true || obj._cp_zone === 'protected') {
        // LOCK the object completely
        obj.set({
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
        });
      } else if (obj._cp_zone === 'safe') {
        // Allow editing within constraints
        obj.set({
          selectable: true,
          evented: true,
          hasControls: true,
        });

        // Apply text constraints
        if (obj.type === 'textbox' && obj._cp_constraints) {
          this.applyTextConstraints(obj as fabric.Textbox, obj._cp_constraints);
        }
      }
    });
  }

  private applyTextConstraints(
    textbox: fabric.Textbox,
    constraints: CPObjectOptions['_cp_constraints']
  ): void {
    if (!constraints) return;

    // Max length constraint
    if (constraints.maxLength) {
      textbox.on('changed', () => {
        const text = textbox.text || '';
        if (text.length > constraints.maxLength!) {
          textbox.text = text.substring(0, constraints.maxLength);
          this.canvas.renderAll();
        }
      });
    }
  }

  // Export methods
  async exportToPNG(): Promise<Blob> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob!));
    });
  }

  async exportToPDF(): Promise<Blob> {
    // Server-side PDF generation via API
    const canvasJson = this.canvas.toJSON([
      '_cp_locked', '_cp_zone', '_cp_data_binding'
    ]);
    
    const response = await fetch('/api/studio/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canvas: canvasJson }),
    });
    
    return response.blob();
  }

  private formatEventDate(datetime?: string): string {
    if (!datetime) return 'Date TBD';
    return new Date(datetime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
```

---

## 4. Event-to-Flyer Pipeline

### 4.1 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     EVENT-TO-FLYER PIPELINE                         │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │ 1. USER      │
  │ Creates Event│
  └──────┬───────┘
         │ POST /api/events
         ▼
  ┌──────────────────┐
  │ 2. EVENT SERVICE │
  │ - Validates data │
  │ - Saves to DB    │
  │ - Emits event    │
  └──────┬───────────┘
         │ EventCreatedEvent
         ▼
  ┌──────────────────────────────┐
  │ 3. FLYER GENERATION LISTENER │
  │ IF event.auto_generate_flyer │
  └──────┬───────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │ 4. TEMPLATE SELECTOR         │
  │ - Match by event type        │
  │ - Prefer tenant templates    │
  │ - Fallback to global         │
  └──────┬───────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │ 5. DATA INJECTOR             │
  │ - Load template JSON         │
  │ - Replace {{variables}}      │
  │ - Apply tenant branding      │
  └──────┬───────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │ 6. CREATE USER_DESIGN        │
  │ - Status: 'draft'            │
  │ - Link to event_id           │
  │ - Save processed canvas_json │
  └──────┬───────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │ 7. NOTIFY USER               │
  │ "Your flyer is ready to      │
  │  customize in Studio"        │
  └──────────────────────────────┘
```

### 4.2 Backend Implementation (NestJS)

```typescript
// modules/events/events.service.ts

@Injectable()
export class EventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  async create(dto: CreateEventDto, user: User): Promise<Event> {
    const event = this.eventRepo.create({
      ...dto,
      tenant_id: user.tenant_id,
      created_by: user.id,
    });

    const savedEvent = await this.eventRepo.save(event);

    // Emit event for flyer generation
    if (savedEvent.auto_generate_flyer) {
      this.eventEmitter.emit('event.created', {
        event: savedEvent,
        tenant: user.tenant,
      });
    }

    return savedEvent;
  }
}

// modules/studio/listeners/flyer-generation.listener.ts

@Injectable()
export class FlyerGenerationListener {
  constructor(
    private readonly templateService: TemplateService,
    private readonly designService: UserDesignService,
    private readonly notificationService: NotificationService,
  ) {}

  @OnEvent('event.created')
  async handleEventCreated(payload: { event: Event; tenant: Tenant }) {
    const { event, tenant } = payload;

    // 1. Select appropriate template
    const template = await this.templateService.selectForEvent(
      event,
      tenant.id,
    );

    if (!template) {
      return; // No matching template found
    }

    // 2. Process template with event data
    const processedCanvas = this.injectEventData(
      template.canvas_json,
      event,
      tenant,
    );

    // 3. Create user design
    const design = await this.designService.create({
      tenant_id: tenant.id,
      branch_id: event.branch_id,
      template_id: template.id,
      event_id: event.id,
      name: `Flyer: ${event.title}`,
      canvas_json: processedCanvas,
      status: 'draft',
      created_by: event.created_by,
    });

    // 4. Update event with design reference
    await this.eventRepo.update(event.id, {
      generated_design_id: design.id,
    });

    // 5. Notify user
    await this.notificationService.send({
      user_id: event.created_by,
      type: 'flyer_ready',
      title: 'Your event flyer is ready!',
      message: `A flyer for "${event.title}" has been auto-generated.`,
      action_url: `/studio/designs/${design.id}`,
    });
  }

  private injectEventData(
    canvasJson: any,
    event: Event,
    tenant: Tenant,
  ): any {
    const jsonString = JSON.stringify(canvasJson);
    
    const context = {
      'event.title': event.title,
      'event.formatted_date': this.formatDate(event.start_datetime),
      'event.venue': event.venue_name || '',
      'event.description': event.description || '',
      'tenant.logo_url': tenant.logo_url,
      'tenant.name': tenant.name,
      ...this.flattenObject(tenant.brand_config, 'tenant.brand_config'),
    };

    let processed = jsonString;
    for (const [key, value] of Object.entries(context)) {
      processed = processed.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        String(value),
      );
    }

    return JSON.parse(processed);
  }
}
```

---

## 5. Future-Proofing for SaaS Commercialization

### 5.1 Critical Technical Considerations

#### 1. Feature Flagging System

```typescript
// lib/feature-flags/feature-flags.service.ts

export enum Feature {
  // Studio Features
  STUDIO_BASIC = 'studio.basic',
  STUDIO_ADVANCED_EXPORT = 'studio.advanced_export',
  STUDIO_VIDEO_TEMPLATES = 'studio.video_templates',
  
  // Finance Features
  FINANCE_BASIC = 'finance.basic',
  FINANCE_MULTI_CURRENCY = 'finance.multi_currency',
  FINANCE_PAYMENT_GATEWAYS = 'finance.payment_gateways',
  
  // People Features
  PEOPLE_UNLIMITED_MEMBERS = 'people.unlimited_members',
  PEOPLE_DISCIPLESHIP_PATHS = 'people.discipleship_paths',
}

@Injectable()
export class FeatureFlagService {
  async hasFeature(tenantId: string, feature: Feature): Promise<boolean> {
    const tenant = await this.tenantRepo.findOne(tenantId);
    const tier = await this.getTierConfig(tenant.subscription_tier);
    
    // Check tier-based features
    if (tier.features.includes(feature)) return true;
    
    // Check tenant-specific overrides
    if (tenant.feature_flags[feature] === true) return true;
    
    return false;
  }
}

// Usage in controllers/services
@UseGuards(FeatureGuard(Feature.STUDIO_ADVANCED_EXPORT))
@Post('export/pdf')
async exportPdf() { ... }
```

#### 2. Subscription & License Management

```sql
-- Subscription tiers configuration
CREATE TABLE subscription_tiers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL,
    limits JSONB NOT NULL,
    -- e.g., {"max_branches": 5, "max_members": 500, "storage_gb": 10}
    is_active BOOLEAN DEFAULT true
);

-- Tenant subscriptions
CREATE TABLE tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    tier_id VARCHAR(50) NOT NULL REFERENCES subscription_tiers(id),
    
    status VARCHAR(50) DEFAULT 'active',
    -- 'active', 'past_due', 'cancelled', 'trial'
    
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    
    -- Payment provider references
    stripe_subscription_id VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Audit Logging for Compliance

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Actor
    user_id UUID,
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Action
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for performance
CREATE INDEX idx_audit_tenant_date ON audit_logs(tenant_id, created_at);
```

### 5.2 Additional Future-Proofing Measures

| Consideration | Implementation |
|--------------|----------------|
| **API Versioning** | Use `/api/v1/` prefix; maintain backward compatibility |
| **Internationalization** | Store all user-facing strings with i18n keys; use ICU message format |
| **White-labeling** | Store branding config in tenant table; support custom domains |
| **Data Export** | Implement GDPR-compliant data export for tenant offboarding |
| **Rate Limiting** | Implement per-tenant rate limits based on subscription tier |

---

## 6. Payment Gateway Integration

### 6.1 M-Pesa (Daraja API) - Kenya

```typescript
// modules/payments/providers/mpesa.provider.ts

@Injectable()
export class MpesaProvider implements PaymentProvider {
  async initiateSTKPush(dto: MpesaPaymentDto): Promise<MpesaResponse> {
    const timestamp = format(new Date(), 'yyyyMMddHHmmss');
    const password = Buffer.from(
      `${this.config.shortcode}${this.config.passkey}${timestamp}`
    ).toString('base64');

    const response = await this.httpService.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: dto.amount,
        PartyA: dto.phone,
        PartyB: this.config.shortcode,
        PhoneNumber: dto.phone,
        CallBackURL: `${this.config.baseUrl}/api/webhooks/mpesa`,
        AccountReference: dto.reference,
        TransactionDesc: dto.description,
      },
      { headers: { Authorization: `Bearer ${await this.getAccessToken()}` } }
    );

    return response.data;
  }
}
```

### 6.2 Stripe - International

```typescript
// modules/payments/providers/stripe.provider.ts

@Injectable()
export class StripeProvider implements PaymentProvider {
  async createPaymentIntent(dto: PaymentDto): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100),
      currency: dto.currency,
      metadata: {
        tenant_id: dto.tenantId,
        purpose: dto.purpose,
        reference: dto.reference,
      },
    });
  }
}
```

---

## 7. MVP Module Priority

| Priority | Module | MVP Scope |
|----------|--------|-----------|
| **P0** | Authentication & Tenancy | Multi-tenant auth, roles, permissions |
| **P0** | Organizational Hierarchy | Tenants, Branches, Ministries CRUD |
| **P1** | Centrepoint Studio | Template loading, locking, basic editing, PNG export |
| **P1** | Events & Calendar | Event CRUD, auto-flyer trigger |
| **P2** | People (CRM) | Member registration, family grouping |
| **P2** | Finance | Tithe/offering recording, basic reports |
| **P3** | PDF Export | Server-side high-quality PDF generation |
| **P3** | Payment Integration | M-Pesa STK Push |

---

## 8. Next Steps

1. **Setup Development Environment**
   - Initialize Next.js frontend with TypeScript
   - Initialize NestJS backend with TypeScript
   - Setup PostgreSQL with initial migrations

2. **Implement Core Tenancy**
   - Authentication with next-auth/NestJS JWT
   - Row-level security policies
   - Tenant context middleware

3. **Build Studio MVP**
   - Fabric.js canvas component
   - Template locking mechanism
   - Basic export functionality

---

*Document prepared for Gospel Centres International (GCI) as pilot tenant.*
*Architecture designed for scalability to 100+ church organizations.*
