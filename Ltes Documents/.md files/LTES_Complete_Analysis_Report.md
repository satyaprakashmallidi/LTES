# LT Energy Services (LTES)
## Complete System Requirements & Process Analysis Report

**Prepared by:** Phanindra Reddy & Team
**Client:** LT Energy Services Ltd. (UK)
**Date:** March 2026
**Project:** Solar Inverter Service Management System

---

# Table of Contents

1. [Executive Summary](#executive-summary)
2. [Company Overview](#company-overview)
3. [Call Recordings Analysis](#call-recordings-analysis)
4. [Current Business Process](#current-business-process)
5. [System Requirements](#system-requirements)
6. [Technical Architecture](#technical-architecture)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Phase 1 Deliverables](#phase-1-deliverables)
9. [Future Phases](#future-phases)
10. [Key Concerns & Recommendations](#key-concerns--recommendations)
11. [Appendices](#appendices)

---

# 1. Executive Summary

LT Energy Services Ltd. is a UK-based solar farm maintenance and inverter repair company seeking to modernize their operations through a custom-built job management and inventory tracking system. Currently, the company relies on multiple disparate systems including spreadsheets, emails, SmartSheets, and SafetyCulture for their daily operations.

The project aims to consolidate all their processes into a single, unified platform that handles:
- Job creation and management
- Technician scheduling
- Inventory and stock control
- RAMS (Risk Assessment & Method Statements) management
- Customer reporting
- Invoicing

This report compiles all requirements gathered from five discovery calls conducted between January and March 2026, providing a comprehensive blueprint for system development.

**Key Statistics:**
- Company Size: ~10 employees
- Current Stock Value: £1.3 - £1.4 million in components
- Inventory Items: ~3,000 products + ~1,000 consumables
- ISO Certification: 9001 (Quality Management)
- Current Systems: SafetyCulture, SmartSheets, Excel spreadsheets

---

# 2. Company Overview

## 2.1 Business Description

LT Energy Services specializes in:
- **Solar farm maintenance**
- **Inverter repair and servicing**
- **Component replacement**
- **Emergency callouts**
- **Preventive maintenance**

## 2.2 Key Personnel

| Name | Role | Responsibilities |
|------|------|------------------|
| Luke Morris | Director / Admin | Scheduling, approvals, inventory management |
| Simon Scott | Office Manager | Job creation, quotes, invoicing |
| Terry | Field Engineer | Scheduling, on-site work |
| Jason | Field Engineer | On-site work |
| Various Engineers | Field Team | Execute maintenance and repairs |

## 2.3 Current Challenges

1. **Data Fragmentation** - Information scattered across multiple systems
2. **Manual Processes** - Heavy reliance on spreadsheets and emails
3. **Limited Visibility** - No real-time view of job statuses
4. **Inventory Gaps** - Poor tracking of stock movements
5. **Reporting Delays** - Manual report compilation
6. **Communication Silos** - WhatsApp used for quick updates

## 2.4 Current Systems in Use

| System | Purpose |
|--------|---------|
| SafetyCulture | Job forms, report generation |
| SmartSheets | Job tracking, data management |
| Excel | Inventory tracking, misc. data |
| Email | Customer communication |
| WhatsApp | Internal communication |
| HSDirect | RAMS document creation |

---

# 3. Call Recordings Analysis

## 3.1 Call Overview

| Call # | Date | Title | Duration | Participants |
|--------|------|-------|----------|--------------|
| 1 | January 20, 2026 | Phase 1 Progress Call 1 | 63 mins | Luke, Simon, Rishi, Satya |
| 2 | February 24, 2026 | Phase 1 Data Meeting | 59 mins | Luke, Simon, Rish, Guna |
| 3 | March 17, 2026 | Technical Review with Marcello | 77 mins | Marcello, Rishi, Satya, Guna |
| 4 | [To be confirmed] | [TBC] | - | - |
| 5 | [To be confirmed] | [TBC] | - | - |

---

## 3.2 Call 1: January 20, 2026 - Phase 1 Progress Call 1

### Participants
- Simon Scott (LT Energy Services)
- Luke Morris (LT Energy Services)
- Rishi (25 Tera Watts / Prosolv)
- Phanindra Reddy (Satya)

### Key Discussion Points

#### Stock Control & Inventory Management
Simon explained their current inventory status:

> "We've got somewhere in the region... we say to customers we do it in euros because it sounds more... but we say between 1.3 and 1.4 million euros worth of components in our stores."

**Current State:**
- Started with just Luke and Terry gathering components
- Components known to become discontinued - stock for emergency repairs
- Goal: Fix inverters same day or first time visit

#### Warehouse Organization
- 11 racks with bin locations
- Location coding system: Rack 1.1, 1.2, then A, B, C, D
- Replicated across multiple rack sides
- Approximately 3,000 items in catalog
- Additional ~1,000 smaller components/consumables

#### Asset Tracking Vision
The ultimate goal includes:
- Sequential barcoding (1001, 1002, 1003...)
- Track product history from supplier to installation
- Know exact shelf location for any item
- Vehicle inventory for engineers
- Scan barcode at installation to update location

> "If one of the guys or the engineers use those products for inventory, a basic inventory on their vehicles. So they have a list what we want them to carry. And then it just changes location, it doesn't change our stock quantity."

#### Barcode Considerations
- Not all items come with manufacturer barcodes
- Small consumables (batteries) to be batched in tens
- Asset numbers assigned upon receipt
- Some items (IGBTs, boards) may not have barcodes

#### Interface Simplicity Requirement
> "The biggest problem that we face, I think, is making it so a child can use it. And if a child can use it, then nobody's got any excuses for not following the system."

#### Stock Movement Flow
1. **Goods In** - Items arrive, sit on pallet
2. **Asset Label** - Assign asset number
3. **Shelf Placement** - Update quantities
4. **Vehicle Assignment** - Engineer checks out items
5. **Installation** - Scan barcode, update location to inverter

#### Data Input Methods Discussed
- Naming convention: PHI (Philips), INV (Inverter), FS (Fuse), 01 (code)
- Digital catalog of all parts
- Barcode scanning for inventory movements

---

## 3.3 Call 2: February 24, 2026 - Phase 1 Data Meeting

### Participants
- Luke Morris (LT Energy Services)
- Simon Scott (LT Energy Services)
- Rish (25 Tera Watts)
- Phanindra Reddy (Satya)
- Guna (Developer)

### Key Discussion Points

#### Job Creation - Page 1 (Initial Information)
When creating a job, the following fields are required:

| Field | Type | Description |
|-------|------|-------------|
| Customer | Dropdown | Company name |
| Site Name | Dropdown | Site location |
| Inverter Location | Dropdown | NOT serial number - e.g., E1, A2 |
| Inverter Model | Dropdown | SMA, ABB, GT, Schneider, etc. |
| Fault Code | Dropdown | Model-specific error codes |
| Priority | Dropdown | High/Medium/Low |
| Issue Reported | Text | Description of problem |

**Critical Requirement - Inverter Location vs Serial Number:**
> "The serial number's okay, but no one knows where the serial numbers are, they just know E1 or A2 or something, you know?"

> "So if we're doing this for the guys who are going to go to site, they need to see what inverter they're going to. True. The serial number's good for a record of that serial number, but as a location, it's not."

#### Smart Dropdown Behavior
- **Site Selection** → Shows only inverters at that specific site
- **Inverter Model Selection** → Shows only fault codes for that model

> "So if you select inverter model and then you go and select 1.1, it will then pre-populate with the serial number."

#### Priority Levels
| Priority | Definition |
|----------|------------|
| High | Inverter not producing - customer on clock |
| Medium | Reduced power production |
| Low | Maintenance visit |

#### Job Creation - Page 2 (Scheduling & Documentation)
| Field | Type | Description |
|-------|------|-------------|
| Quote Number | Text | Quote reference |
| Purchase Order | Text | Customer PO |
| Scheduled Date | Date | Job booking date |
| RAMS Status | Checkbox | Uploaded/Approved |
| Invoice Number | Text | Invoice reference |
| Report Link | URL | Link to completion report |

#### Quote Process Workflow
1. Create quote → Send to customer
2. Customer approves → Receives Purchase Order
3. Job marked as "Approved"
4. Can proceed to scheduling

#### RAMS Integration
- Download RAMS from HSDirect as PDF
- Upload to job record
- Attached to job for engineer access

> "So you create these RAMS, download them as PDF documents, two documents, and then you can send them on."

#### Auto Job Sheet Generation
**Trigger:** When job is scheduled AND RAMS uploaded

**Contents:**
- Site gate codes
- Security numbers
- What3Words location
- Engineer assignment
- Fault details
- Contact information

> "Once this is like booked, and someone is scheduled to go, that should be like, it's got all the information of gatecodes, security numbers, the what three words or something, you know?"

#### Job Status Swim Lanes (Kanban Board)

| Stage | Description |
|-------|-------------|
| 1. Logged Fault | Initial job creation |
| 2. Quote Sent | Quote submitted to customer |
| 3. Approved | PO received from customer |
| 4. Scheduled | Date booked, engineer assigned |
| 5. Completed | Work done, report submitted |
| 6. Invoiced | Invoice sent to customer |

**Additional States Discussed:**
- Pending RAMS
- RAMS Sent
- RAMS Approved
- Report Missing

#### Dashboard Features Requested

**Calendar Views:**
- Today view: Jobs assigned for today
- Weekly view: Jobs for the week
- Monthly view: Overview of all jobs

**Filters:**
- By technician/engineer
- By job type
- By site name
- By priority
- By contract type (chargeable, SLA)

**Kanban Board:**
- Drag-and-drop job cards between columns
- Visual status tracking
- Color-coded priority

#### Form Field Order (As Described by Simon)
**Page 1 - Job Creation:**
1. Customer (dropdown)
2. Site (dropdown)
3. Inverter Location (dropdown - E1, A2, etc.)
4. Inverter Model (dropdown)
5. Fault Code (dropdown)
6. Priority (dropdown)
7. Issue Reported (text)

**Page 2 - Scheduling:**
1. Quote Number
2. Purchase Order Number
3. Scheduled Date
4. RAMS Upload/Confirmation
5. Invoice Number
6. Report Link

#### Role Permissions
| Role | Permissions |
|------|-------------|
| Admin (Luke) | Full access - can do everything including scheduling |
| Office Staff (Simon) | Create jobs, quotes, view all - cannot schedule |
| Field Engineers | View assigned jobs, submit reports |

#### Future Features Discussed
- **Map View:** Show jobs on map by location
- **Travel Time:** Calculate distance from engineer home to site
- **Parts Packs:** Pre-defined parts for specific fault codes
- **Customer Portal:** Self-service job submission

---

## 3.4 Call 3: March 17, 2026 - Technical Review with Marcello

### Participants
- Marcello Scacchetti (Technical Consultant)
- Rishi (Prosolv)
- Phanindra Reddy (Satya)
- Guna (Developer)
- LT Energy Services (via chat)

### Key Discussion Points

#### Technology Stack
**Primary Platform:** ERPNext
- Open-source ERP system
- Written in Python/JavaScript
- ~30,000 GitHub stars
- Similar to Salesforce level capability
- £25/month for unlimited users
- Automatic daily backups
- GDPR and HIPAA compliant
- EU data storage

**Custom Development:**
- Client scripts written in JavaScript
- Custom dashboard built on top
- Front-end: Custom job dashboard
- Back-end: ERPNext

#### Phase 1 Deliverables Demo

**Job Dashboard Features:**
- Job board with status columns
- Auto-calculated job status
- Live job visibility
- Technician assignment
- Status management

**Auto-Populate Logic:**
- Site selection → Shows available inverter locations
- Inverter location → Auto-fills model and serial number
- Contract type → Determines priority settings

**Inverter Production Status:**
- In Production = Working fine
- Not in Production = Stopped working

#### Data Requirements
**Customer Data:**
- Customer name
- Contact information
- Site associations

**Site Data:**
- Site name
- Location
- Postcode
- All inverter locations at site

**Inventory Data:**
- Equipment model
- Serial numbers
- Location codes

#### Feature Requests from Demo

**1. Search/Filter Improvements:**
- Typeable search fields (not just dropdowns)
- Multiple site selection in filters

**2. Report Generation:**
- PDF download button needed
- One-click report completion

**3. Parts Used Section:**
- Dropdown from inventory
- Should subtract from stock when used
- Manual replenishment option

> "If the inventory is there, then if they choose a part from the inventory, it should subtract."

#### User Permissions Concern

Marcello raised concerns about training complexity:

> "The only thing I see is that they have to be trained on two platforms... ERP comes with complexity... my suggestion is to focus on that, to make sure that they use it correctly."

**Recommended Approach:**
1. **Dashboard** for 90% of users (job board, calendar, basic functions)
2. **Backend** for only 1-2 admin users
3. **Pre-defined roles** instead of flexible permissions:
   - Owner (full access)
   - Inventory Manager
   - Project Manager
   - Technician

**Simplified Access:**
> "The user experience doesn't change by just one click... for Luke or somebody that's their main guy to have this back-end, that they would see that back-end and nobody else will."

#### Bookmark System
For Phase 1, implement bookmarks that link directly to specific backend pages:
- Click "Inventory" → Opens ERPNext inventory page directly
- Reduces need to navigate full backend
- User doesn't realize it's a different system

#### Marcello's Key Recommendations

1. **Minimize Backend Usage:**
   - Only 1 person needs full backend access
   - Everyone else uses dashboard only

2. **Simplified Frontend:**
   - Basic inventory list with search
   - Site list with add/edit functionality
   - Don't recreate full ERP in dashboard

3. **User-Friendly Permissions:**
   - Pre-defined user roles
   - Don't make Luke manage complex permissions

4. **Documentation:**
   - Provide guides for each function
   - Video tutorials

#### Technical Concerns Addressed

**Versioning/Maintenance:**
> "I'm concerned about the maintenance, to make sure that if we introduce a change, then that change is backward compatible, we don't introduce bugs, and it's possible to roll back the previous version."

**Response:** ERPNext is stable, client scripts can be version-controlled.

**Data Backup:**
- Daily automatic backups
- Can restore from any day
- Data export available

**API Integrations:**
- SafetyCulture API available
- Can integrate for report pulling

#### Future Feature: Customer Portal
- Customer login to see their site status
- See inverter diagrams with component history
- Visual representation of inverter internals

> "So what I'm talking about is like, the inverter is a box, right? It's a cupboard... you open the cupboard, then you can see all the components inside."

#### Voice Note Feature (Future)
- Button for engineers to record voice
- AI summarizes to text

---

# 4. Current Business Process

## 4.1 End-to-End Job Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         JOB LIFECYCLE                                   │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │   CUSTOMER   │
     │   REPORTS    │
     │    ISSUE     │
     └──────┬───────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: JOB CREATION (Page 1)                                      │
│  - Select Customer → Site → Inverter Location → Fault Code         │
│  - Set Priority (High/Medium/Low)                                   │
│  - Describe Issue Reported                                           │
│  - Job Status: "Logged Fault"                                       │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: QUOTE PROCESS                                              │
│  - Create Quote                                                      │
│  - Send to Customer                                                  │
│  - Job Status: "Quote Sent"                                         │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: APPROVAL                                                   │
│  - Receive Purchase Order                                            │
│  - Job Status: "Approved"                                           │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: SCHEDULING                                                 │
│  - Select Date                                                      │
│  - Assign Engineer/Techician                                         │
│  - Job Status: "Scheduled"                                          │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: RAMS PREPARATION                                           │
│  - Download from HSDirect                                            │
│  - Upload to Job                                                    │
│  - Send for Approval (if needed)                                     │
│  - Job Status: "RAMS Complete"                                      │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: JOB SHEET GENERATION (AUTOMATIC)                          │
│  - Gate Codes                                                       │
│  - Security Numbers                                                 │
│  - What3Words Location                                              │
│  - Engineer Assignment                                              │
│  - Site Contact Details                                             │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: FIELD WORK                                                 │
│  - Engineer visits site                                              │
│  - Uses Job Sheet + Site Information                                │
│  - Performs repairs/maintenance                                      │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 8: REPORT SUBMISSION                                          │
│  - Complete SafetyCulture Report                                    │
│  - Attach to Job                                                    │
│  - Job Status: "Completed"                                          │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 9: INVOICING                                                  │
│  - Create Invoice                                                   │
│  - Send to Customer                                                 │
│  - Job Status: "Invoiced"                                           │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
     ┌──────────────┐
     │   ARCHIVE    │
     └──────────────┘
```

## 4.2 Swim Lanes / Kanban Columns

| Column | Status | Description |
|--------|--------|-------------|
| 1 | Logged Fault | New jobs, awaiting quote |
| 2 | Quote Sent | Quote submitted, awaiting PO |
| 3 | Approved | PO received, ready to schedule |
| 4 | Scheduled | Date booked, engineer assigned |
| 5 | Completed | Work done, report submitted |
| 6 | Invoiced | Invoice sent to customer |

## 4.3 Stock Movement Flow

```
     ┌─────────────┐
     │   SUPPLIER  │
     │   DELIVERY  │
     └──────┬──────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  GOODS IN                                                     │
│  - Items arrive on pallet                                    │
│  - Awaiting processing                                       │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  ASSET LABELING                                               │
│  - Assign sequential asset number                            │
│  - Scan/enter barcode                                        │
│  - Record supplier details                                    │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  WAREHOUSE SHELF                                              │
│  - Place in bin location (e.g., 1.1A)                       │
│  - Update quantity in system                                  │
└─────────────────────────────────────────────────────────────┘
            │
            ├──────────────────┐
            │                  │
            ▼                  ▼
┌─────────────────────┐  ┌─────────────────────┐
│   ENGINEER VAN      │  │    RESERVED FOR     │
│   (Vehicle Stock)   │  │    SPECIFIC JOB     │
│  - Check out items  │  │  - Held for job     │
│  - Location = Van   │  │  - Status: Picked   │
└─────────────────────┘  └─────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  SITE INSTALLATION                                            │
│  - Scan item at inverter                                      │
│  - Location = Inverter Serial                                 │
│  - Record install date                                        │
│  - Update warranty tracking                                   │
└─────────────────────────────────────────────────────────────┘
```

---

# 5. System Requirements

## 5.1 Job Management

### 5.1.1 Job Creation

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Multi-page form | Critical | Page 1 (core info), Page 2 (scheduling) |
| Smart dropdowns | Critical | Cascading selects |
| Auto-populate | Critical | Site→Inverter→Serial→Model→FaultCode |
| Customer selection | Critical | From customer database |
| Site selection | Critical | Filtered by customer |
| Inverter location | Critical | NOT serial - location code (E1, A2) |
| Inverter model | Critical | SMA, ABB, GT, Schneider, etc. |
| Fault code | Critical | Model-specific dropdown |
| Priority selection | Critical | High/Medium/Low |
| Issue description | Critical | Free text field |

### 5.1.2 Job Status Management

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Kanban board | Critical | Drag-and-drop between columns |
| Auto-status calculation | High | Based on field completion |
| Status history | High | Audit trail of changes |
| Notes/comments | Medium | Internal communication |

### 5.1.3 Job Dashboard

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Status columns | Critical | 6 swim lanes |
| Job cards | Critical | Show key info at glance |
| Quick actions | High | Edit, view, delete |
| Color coding | High | Priority, status |
| Search | Critical | Find jobs quickly |

## 5.2 Scheduling

### 5.2.1 Calendar Views

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Today view | Critical | Today's jobs |
| Weekly view | Critical | Week overview |
| Monthly view | High | Month overview |
| Drag-to-schedule | High | Click and drag to assign |

### 5.2.2 Engineer Management

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Engineer assignment | Critical | Assign to job |
| Availability view | High | See who's free |
| Skill matching | Medium | Match engineer to job type |

## 5.3 Inventory Management

### 5.3.1 Stock Tracking

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Item catalog | Critical | All products with details |
| Location tracking | Critical | Warehouse bin, van, site |
| Quantity management | Critical | Current stock levels |
| Serial number tracking | High | Per-item history |
| Barcode support | High | Scan to lookup |

### 5.3.2 Stock Movements

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Goods receipt | High | Add new stock |
| Van stock check-out | High | Engineer takes items |
| Installation scan | High | Record install location |
| Return handling | Medium | Unused items return |
| Stock count | Medium | Periodic reconciliation |

### 5.3.3 Parts Integration

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Job-parts linking | Critical | Select parts for job |
| Auto-deduct stock | Critical | Subtract used parts |
| Parts history | High | What's been used where |
| Low stock alerts | Medium | Reorder warnings |

## 5.4 Document Management

### 5.4.1 RAMS

| Requirement | Priority | Description |
|-------------|----------|-------------|
| RAMS upload | Critical | PDF attachment |
| RAMS status tracking | Critical | Pending/Sent/Approved |
| RAMS template | High | Standard forms |

### 5.4.2 Reports

| Requirement | Priority | Description |
|-------------|----------|-------------|
| PDF generation | Critical | Job completion reports |
| Report linking | Critical | Link external reports |
| Report history | High | All versions |

### 5.4.3 Attachments

| Requirement | Priority | Description |
|-------------|----------|-------------|
| File upload | High | Quotes, POs, Invoices |
| File types | High | PDF, images, documents |
| Storage | High | Secure cloud storage |

## 5.5 Reporting & Analytics

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Dashboard overview | High | Summary statistics |
| Job reports | High | By status, engineer, site |
| Inventory reports | Medium | Stock levels, movements |
| Missing reports flag | High | Alert incomplete jobs |

## 5.6 User Interface

### 5.6.1 Simplicity Requirements

> "I want it to be easy. I want it to be flowing. It should be something that I don't need. The people that work for me are very simple, not even very highly educated. They just know how to repair inverters. That's it. So for them, it should be click, click, click, done."

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Minimal typing | Critical | Dropdowns over text input |
| Large click targets | High | Easy for non-tech users |
| Clear labels | High | No confusion |
| Mobile-friendly | High | Works on tablets in field |
| Color contrast | High | Accessible design |

### 5.6.2 Filtering & Search

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Typeable filters | Critical | Search, not just select |
| Multiple select | High | Filter by multiple values |
| Save filters | Medium | Remember preferences |

---

# 6. Technical Architecture

## 6.1 Technology Stack

### Primary Platform
| Component | Technology | Notes |
|-----------|------------|-------|
| Backend | ERPNext | Open source ERP |
| Database | PostgreSQL | Via ERPNext |
| Frontend | Custom React/JS | Dashboard |
| Hosting | ERPNext Cloud | £25/month |
| Data Center | EU (Germany) | GDPR compliant |

### Integrations
| System | Purpose | Status |
|--------|---------|--------|
| SafetyCulture | Report generation | Future integration |
| HSDirect | RAMS documents | Manual upload |
| QuickBooks | Accounting | Future consideration |

## 6.2 Data Model

### Core Entities

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CUSTOMER   │────<│    SITE     │────<│  INVERTER   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │                   ├─ Serial Number
                           │                   ├─ Model
                           │                   └─ Location Code
                           │
                    ┌──────┴──────┐
                    │     JOB     │
                    └─────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │ SCHEDULE  │   │   PARTS   │   │  DOCUMENTS│
    └───────────┘   └───────────┘   └───────────┘
```

### Entity Definitions

#### Customer
- ID
- Company Name
- Contact Name
- Email
- Phone
- Address

#### Site
- ID
- Customer (FK)
- Site Name
- Address
- Postcode
- Gate Code
- Security Info
- What3Words

#### Inverter
- ID
- Site (FK)
- Location Code (E1, A2, etc.)
- Model
- Serial Number
- In Production (Boolean)

#### Job
- ID
- Customer (FK)
- Site (FK)
- Inverter (FK)
- Status
- Priority
- Quote Number
- Purchase Order
- Scheduled Date
- Engineer Assigned
- Issue Reported
- Fault Code
- Report Link
- Invoice Number

#### Parts Used
- ID
- Job (FK)
- Part (FK)
- Quantity
- Date Used

#### Inventory Item
- ID
- SKU
- Name
- Description
- Category
- Current Quantity
- Warehouse Location
- Reorder Level

---

# 7. User Roles & Permissions

## 7.1 Role Definitions

| Role | Users | Dashboard Access | Backend Access | Description |
|------|-------|-----------------|----------------|-------------|
| Admin | Luke | Full | Full | Everything |
| Office | Simon | Full | None | Create jobs, quotes, view all |
| Engineer | Terry, Jason | Limited | None | View assigned, submit reports |

## 7.2 Permission Matrix

| Feature | Admin | Office | Engineer |
|---------|-------|--------|----------|
| Create Job | ✓ | ✓ | ✗ |
| Edit Job | ✓ | ✓ | ✗ |
| Delete Job | ✓ | ✗ | ✗ |
| Schedule Job | ✓ | ✗ | ✗ |
| Assign Engineer | ✓ | ✗ | ✗ |
| View All Jobs | ✓ | ✓ | Own only |
| Submit Report | ✓ | ✓ | ✓ |
| Upload RAMS | ✓ | ✓ | ✗ |
| Manage Customers | ✓ | ✓ | ✗ |
| Manage Sites | ✓ | ✓ | ✗ |
| View Inventory | ✓ | Read | ✗ |
| Manage Inventory | ✓ | ✗ | ✗ |
| Generate Reports | ✓ | ✓ | ✗ |
| Invoice Jobs | ✓ | ✓ | ✗ |

---

# 8. Phase 1 Deliverables

## 8.1 Job Management Dashboard

### Core Features
1. **Kanban Board**
   - 6 columns (Logged → Quote → Approved → Scheduled → Completed → Invoiced)
   - Drag-and-drop cards
   - Quick status updates

2. **Job Creation Form**
   - Page 1: Customer, Site, Inverter, Fault Code, Priority
   - Page 2: Quote, PO, Schedule, RAMS, Invoice

3. **Smart Dropdowns**
   - Customer → Site → Inverter → Model → Serial → Fault Code
   - Cascading auto-population

4. **Search & Filter**
   - By status
   - By engineer
   - By site
   - By priority
   - By contract type
   - Typeable search fields

### Acceptance Criteria
- [ ] Jobs can be created with all required fields
- [ ] Dropdowns cascade correctly (Site shows only inverters at that site)
- [ ] Status changes reflect immediately on dashboard
- [ ] All 6 Kanban columns display correctly
- [ ] Filters work for all criteria
- [ ] Jobs can be edited and deleted

---

## 8.2 Calendar Module

### Features
1. **Today View**
   - Shows all jobs for current day
   - Engineer assignment visible

2. **Weekly View**
   - 7-day overview
   - Engineer allocation visible

3. **Monthly View**
   - Full month grid
   - Status indicators

4. **Quick Scheduling**
   - Click date to create job
   - Drag jobs to reschedule

### Acceptance Criteria
- [ ] All three views (day/week/month) work
- [ ] Jobs display on correct dates
- [ ] Engineer assignment shows
- [ ] Click to create works
- [ ] Can filter by engineer

---

## 8.3 Basic Inventory View

### Features
1. **Item List**
   - Table view of all items
   - Searchable
   - Sortable columns

2. **Stock Levels**
   - Current quantity display
   - Location shown

3. **Basic Add/Edit (Admin only)**
   - Add new items
   - Edit existing items

### Acceptance Criteria
- [ ] All inventory items listed
- [ ] Search works
- [ ] Quantities display
- [ ] Location visible

---

## 8.4 Document Management

### Features
1. **RAMS Upload**
   - File upload to job
   - Status tracking (Pending/Sent/Approved)

2. **Report Linking**
   - Link to external reports
   - SafetyCulture integration ready

3. **Attachment Support**
   - Quotes, POs, Invoices
   - PDF viewing

### Acceptance Criteria
- [ ] Files can be uploaded to jobs
- [ ] RAMS status can be updated
- [ ] Report links can be added
- [ ] Files downloadable

---

## 8.5 Reporting

### Features
1. **Dashboard Overview**
   - Total jobs by status
   - Engineer workload

2. **Missing Reports Alert**
   - Flag jobs without reports

### Acceptance Criteria
- [ ] Statistics display correctly
- [ ] Missing reports identified

---

## 8.6 User Management

### Features
1. **User Roles**
   - Admin
   - Office
   - Engineer

2. **Role-Based Access**
   - Dashboard restricted by role
   - Backend access limited

### Acceptance Criteria
- [ ] Users can be created
- [ ] Roles assign correctly
- [ ] Access restrictions enforced

---

# 9. Future Phases

## 9.1 Phase 2 (Suggested)

### Inventory & Stock Control
| Feature | Description |
|---------|-------------|
| Full Inventory Module | Complete stock management |
| Barcode Scanning | Mobile app scanning |
| Van Stock | Engineer vehicle inventory |
| Auto-Deduct | Parts used auto-subtract |
| Low Stock Alerts | Reorder notifications |
| Supplier Management | Supplier database |

### Enhanced Scheduling
| Feature | Description |
|---------|-------------|
| Map View | Job locations on map |
| Travel Time | Distance from engineer home |
| Parts Packs | Pre-defined for fault codes |
| Route Optimization | Best route for day |

### Customer Portal
| Feature | Description |
|---------|-------------|
| Customer Login | View own jobs |
| Job Submission | Self-service reporting |
| Site Status | View inverter status |

## 9.2 Phase 3 (Suggested)

### Advanced Features
- Voice-to-text notes
- AI-powered fault diagnosis suggestions
- Predictive maintenance alerts
- Warranty tracking
- Supplier performance analytics

### Mobile App
- Offline capability
- Push notifications
- Photo capture
- GPS check-in

---

# 10. Key Concerns & Recommendations

## 10.1 From Call Discussions

### Simplicity
**Quote:** "The biggest problem that we face, I think, is making it so a child can use it."

**Recommendation:**
- Minimize free text fields
- Use dropdowns wherever possible
- Large, clear buttons
- Consistent navigation

### Training Burden
**Quote:** "I don't want a child messing up with this... It should be click, click, click, done."

**Recommendation:**
- Limit backend access to 1 person
- Provide video tutorials
- Create quick-reference guides
- Use bookmarks for complex tasks

### Data Migration
**Quote:** "We haven't received the data related to code number."

**Recommendation:**
- Clean data before import
- Create validation rules
- Allow manual overrides
- Build import templates

### Integration
**Quote:** "SafetyCulture API is available."

**Recommendation:**
- Phase 1: Manual linking
- Phase 2: API integration
- Build report import workflow

---

# 11. Appendices

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| RAMS | Risk Assessment & Method Statements |
| Kanban | Visual workflow board with columns |
| ERPNext | Enterprise Resource Planning system |
| SKU | Stock Keeping Unit |
| PO | Purchase Order |
| Inverter | Device converting DC to AC power |
| What3Words | Location addressing system |

## Appendix B: Data Requirements

### Customer Fields
- Company Name
- Contact Person
- Email Address
- Phone Number
- Billing Address

### Site Fields
- Site Name
- Address
- Postcode
- Gate Code
- Security Number
- What3Words
- Contact on Site

### Inverter Fields
- Location Code (E1, A2, etc.)
- Model (SMA, ABB, etc.)
- Serial Number
- In Production Status

### Job Fields
- Customer Reference
- Site Reference
- Inverter Reference
- Fault Code
- Priority
- Issue Description
- Quote Number
- Purchase Order
- Scheduled Date
- Engineer Assigned
- RAMS Status
- Report Link
- Invoice Number

## Appendix C: Meeting Notes Summary

### Call 1 - Key Actions
- Define naming convention for inventory items
- Plan barcode system
- Create warehouse bin layout

### Call 2 - Key Actions
- Implement multi-page job form
- Build cascading dropdowns
- Create Kanban board
- Add calendar views

### Call 3 - Key Actions
- Finalize Phase 1 scope
- Create user role definitions
- Build bookmark system
- Document training plan

---

**Document Version:** 1.0
**Last Updated:** March 2026
**Prepared For:** LT Energy Services Ltd.
