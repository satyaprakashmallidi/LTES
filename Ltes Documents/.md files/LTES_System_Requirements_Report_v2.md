# LT ENERGY SERVICES LTD.
## System Requirements & Process Analysis Report

**Project:** Solar Inverter Service Management System
**Client:** LT Energy Services Ltd. (UK)
**Date:** March 2026
**Version:** 2.0 (For Review)

---

# TABLE OF CONTENTS

1. Company Background
2. Current Problems & Challenges
3. Discovery Call Summary
4. Business Process Flow
5. System Requirements
6. User Roles & Permissions
7. Phase 1 Deliverables
8. Data Fields Required
9. Future Requirements
10. Technical Notes

---

# 1. COMPANY BACKGROUND

## 1.1 About LT Energy Services

| Detail | Information |
|--------|-------------|
| Company Name | LT Energy Services Ltd. |
| Location | UK |
| Industry | Solar Farm Maintenance & Inverter Repair |
| Company Size | ~10 employees |
| ISO Certification | ISO 9001 (Quality Management) |

## 1.2 Key Personnel

| Name | Role |
|------|------|
| Luke Morris | Director / Admin |
| Simon Scott | Office Manager |
| Terry | Field Engineer (Scheduling) |
| Jason | Field Engineer |
| Various Engineers | Field Team |

## 1.3 Current Inventory Status

| Metric | Value |
|--------|-------|
| Total Products | ~3,000 items |
| Consumables | ~1,000 items |
| Stock Value | £1.3 - £1.4 million |
| Warehouse Racks | 11 racks with bin locations |

---

# 2. CURRENT PROBLEMS & CHALLENGES

## 2.1 Problems Identified

1. **Data Fragmentation**
   - Information spread across multiple systems
   - No single source of truth

2. **Manual Processes**
   - Heavy reliance on spreadsheets
   - Email-based communication
   - WhatsApp for quick updates

3. **Limited Visibility**
   - No real-time job status view
   - Difficult to track outstanding items

4. **Inventory Gaps**
   - Poor tracking of stock movements
   - No clear location tracking

5. **Reporting Delays**
   - Manual report compilation
   - No automatic job sheets

## 2.2 Current Systems in Use

| System | Purpose |
|--------|---------|
| SafetyCulture | Job forms, report generation |
| SmartSheets | Job tracking |
| Excel | Inventory tracking |
| Email | Customer communication |
| WhatsApp | Internal communication |
| HSDirect | RAMS document creation |

---

# 3. DISCOVERY CALL SUMMARY

## 3.1 Call Details

| Call | Date | Duration | Topic |
|------|------|----------|-------|
| Call 1 | Jan 20, 2026 | 63 mins | Stock & Inventory Planning |
| Call 2 | Feb 24, 2026 | 59 mins | Job Management & Data |
| Call 3 | Mar 17, 2026 | 77 mins | Technical Review |

---

## CALL 1: JANUARY 20, 2026 - STOCK & INVENTORY

### What We Learned:

**Warehouse Setup:**
- 11 racks with bin locations (e.g., 1.1A, 1.2B)
- Items organized by location
- Sequential barcoding system planned

**Stock Movement Vision:**
```
Supplier → Goods In → Asset Label → Shelf → Van → Site
```

**Key Quote from Simon:**
> "The biggest problem that we face is making it so a child can use it. If a child can use it, then nobody's got any excuses."

---

## CALL 2: FEBRUARY 24, 2026 - JOB MANAGEMENT

### What We Learned:

**Job Creation Flow (2 Pages):**

**Page 1 - Job Details:**
- Customer (dropdown)
- Site Name (dropdown)
- Inverter Location (NOT serial - e.g., E1, A2)
- Inverter Model (SMA, ABB, GT, Schneider)
- Fault Code (model-specific dropdown)
- Priority (High/Medium/Low)
- Issue Reported (description)

**Page 2 - Scheduling:**
- Quote Number
- Purchase Order Number
- Scheduled Date
- RAMS Status
- Invoice Number
- Report Link

### Important Requirement - Smart Dropdowns:

When user selects:
1. **Customer** → Shows only their sites
2. **Site** → Shows only inverters at that site
3. **Inverter Model** → Shows only fault codes for that model

### Priority Levels:

| Priority | Meaning |
|----------|---------|
| HIGH | Inverter not producing - customer on clock |
| MEDIUM | Reduced power production |
| LOW | Maintenance visit |

### Job Status (Kanban Columns):

| # | Status | Description |
|---|--------|-------------|
| 1 | Logged Fault | New job created |
| 2 | Quote Sent | Quote submitted to customer |
| 3 | Approved | PO received |
| 4 | Scheduled | Date booked, engineer assigned |
| 5 | Completed | Work done, report submitted |
| 6 | Invoiced | Invoice sent |

### Auto Job Sheet Generation:

**Trigger:** When job is scheduled AND RAMS uploaded

**Contents:**
- Site gate codes
- Security numbers
- What3Words location
- Engineer assignment
- Fault details

---

## CALL 3: MARCH 17, 2026 - TECHNICAL REVIEW

### Technology Choice: ERPNext

| Feature | Details |
|---------|---------|
| Platform | ERPNext (Open Source ERP) |
| Cost | £25/month unlimited users |
| Backup | Daily automatic |
| Data | EU storage (GDPR compliant) |
| Custom | JavaScript client scripts |

### User Access Concerns:

**Marcello's Recommendation:**
- Only 1-2 people need backend access
- Everyone else uses simple dashboard
- Create pre-defined user roles

### Phase 1 Features Demo'd:

- Job dashboard with Kanban
- Calendar views (today/week/month)
- Auto-populate fields
- Filter options
- Report download button (to be added)

### Key Concern Raised:

> "I want it to be easy. I want it to be flowing. It should be click, click, click, done. The people that work for me are very simple. They just know how to repair inverters."

---

# 4. BUSINESS PROCESS FLOW

## 4.1 Complete Job Lifecycle

```
STEP 1: JOB CREATED
    ↓
    Customer reports issue
    ↓
    Create job (Page 1): Customer → Site → Inverter → Fault Code → Priority
    Status: "LOGGED FAULT"

STEP 2: QUOTE
    ↓
    Create & send quote to customer
    Status: "QUOTE SENT"

STEP 3: APPROVAL
    ↓
    Receive Purchase Order from customer
    Status: "APPROVED"

STEP 4: SCHEDULING
    ↓
    Select date & assign engineer
    Status: "SCHEDULED"

STEP 5: RAMS
    ↓
    Download from HSDirect → Upload to job
    Status: "RAMS COMPLETE"

STEP 6: JOB SHEET (AUTO)
    ↓
    System generates job sheet with:
    - Gate codes, Security info, What3Words
    - Engineer assignment, Fault details

STEP 7: FIELD WORK
    ↓
    Engineer visits site with job sheet

STEP 8: COMPLETION
    ↓
    Submit report (SafetyCulture)
    Link to job
    Status: "COMPLETED"

STEP 9: INVOICING
    ↓
    Create & send invoice
    Status: "INVOICED"

STEP 10: ARCHIVE
```

## 4.2 Stock Movement Flow

```
GOODS IN → ASSET LABEL → WAREHOUSE SHELF → (SPLIT)
                                              ↓
                                    ENGINEER VAN / RESERVED JOB
                                              ↓
                                    SITE INSTALLATION
                                              ↓
                                    WARRANTY TRACKING
```

---

# 5. SYSTEM REQUIREMENTS

## 5.1 Job Management

| # | Requirement | Priority |
|---|-------------|----------|
| 1 | Multi-page job form (Page 1 & Page 2) | CRITICAL |
| 2 | Smart cascading dropdowns | CRITICAL |
| 3 | Auto-populate fields | CRITICAL |
| 4 | Kanban board with 6 columns | CRITICAL |
| 5 | Drag-and-drop status changes | HIGH |
| 6 | Job search functionality | CRITICAL |
| 7 | Filter by status/engineer/site/priority | CRITICAL |
| 8 | Typeable search fields (not just dropdown) | CRITICAL |

## 5.2 Scheduling

| # | Requirement | Priority |
|---|-------------|----------|
| 1 | Calendar - Today view | CRITICAL |
| 2 | Calendar - Weekly view | CRITICAL |
| 3 | Calendar - Monthly view | HIGH |
| 4 | Click-to-schedule | HIGH |
| 5 | Engineer assignment | CRITICAL |

## 5.3 Inventory

| # | Requirement | Priority |
|---|-------------|----------|
| 1 | Product catalog with details | CRITICAL |
| 2 | Location tracking (bin locations) | HIGH |
| 3 | Quantity management | HIGH |
| 4 | Stock level display | CRITICAL |
| 5 | Searchable item list | CRITICAL |

## 5.4 Documents

| # | Requirement | Priority |
|---|-------------|----------|
| 1 | RAMS upload (PDF) | CRITICAL |
| 2 | RAMS status tracking | CRITICAL |
| 3 | Report link attachment | HIGH |
| 4 | Quote/PO/Invoice attachments | HIGH |

## 5.5 Reporting

| # | Requirement | Priority |
|---|-------------|----------|
| 1 | Dashboard overview/stats | HIGH |
| 2 | Missing reports alert | HIGH |
| 3 | PDF report download | CRITICAL |

---

# 6. USER ROLES & PERMISSIONS

## 6.1 Roles Defined

| Role | Who | Dashboard | Backend | Can Schedule |
|------|-----|-----------|---------|--------------|
| ADMIN | Luke | Full | Full | Yes |
| OFFICE | Simon | Full | None | No |
| ENGINEER | Terry, Jason | Limited | None | No |

## 6.2 Permission Matrix

| Action | Admin | Office | Engineer |
|--------|-------|--------|----------|
| Create Job | ✓ | ✓ | ✗ |
| Edit Any Job | ✓ | ✓ | ✗ |
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
| Generate Invoices | ✓ | ✓ | ✗ |

---

# 7. PHASE 1 DELIVERABLES

## 7.1 Job Dashboard

- [ ] 6-column Kanban board
- [ ] Job cards with key info
- [ ] Drag-and-drop status changes
- [ ] Quick edit/delete actions
- [ ] Color-coded priority

## 7.2 Job Creation Form

- [ ] Page 1: Customer, Site, Inverter, Fault Code, Priority
- [ ] Page 2: Quote, PO, Schedule, RAMS, Invoice
- [ ] Smart dropdowns that cascade
- [ ] Auto-populate based on selections

## 7.3 Calendar Module

- [ ] Today view
- [ ] Weekly view
- [ ] Monthly view
- [ ] Click to create job
- [ ] Filter by engineer

## 7.4 Inventory View

- [ ] Product list table
- [ ] Search functionality
- [ ] Quantity display
- [ ] Location display

## 7.5 Document Management

- [ ] File upload to jobs
- [ ] RAMS status updates
- [ ] Report link field

## 7.6 User Management

- [ ] Create users
- [ ] Assign roles
- [ ] Enforce permissions

---

# 8. DATA FIELDS REQUIRED

## 8.1 Customer

- Company Name
- Contact Name
- Email
- Phone
- Address

## 8.2 Site

- Site Name
- Customer (link)
- Address
- Postcode
- Gate Code
- Security Number
- What3Words
- Site Contact Name
- Site Contact Phone

## 8.3 Inverter

- Site (link)
- Location Code (e.g., E1, A2)
- Model (SMA, ABB, GT, Schneider, etc.)
- Serial Number
- In Production (Yes/No)

## 8.4 Job

- Job Number (auto)
- Customer (link)
- Site (link)
- Inverter (link)
- Status (6 options)
- Priority (High/Medium/Low)
- Issue Reported
- Fault Code
- Quote Number
- Purchase Order
- Scheduled Date
- Assigned Engineer
- RAMS Status (Pending/Sent/Approved)
- Report Link
- Invoice Number
- Created Date
- Modified Date

## 8.5 Inventory Item

- SKU
- Name
- Description
- Category
- Current Quantity
- Warehouse Location
- Reorder Level

---

# 9. FUTURE REQUIREMENTS

## 9.1 Phase 2 (Suggested)

| Feature | Description |
|---------|-------------|
| Full Inventory Module | Complete stock management with barcode scanning |
| Van Stock | Engineer vehicle inventory tracking |
| Auto-Parts Deduct | Parts used auto-subtract from stock |
| Map View | Job locations on map |
| Travel Time | Distance calculation from engineer home |
| Parts Packs | Pre-defined parts for specific faults |
| Customer Portal | Self-service job submission |

## 9.2 Phase 3 (Suggested)

| Feature | Description |
|---------|-------------|
| Voice Notes | Voice-to-text for field notes |
| AI Diagnostics | Fault suggestions based on history |
| Mobile App | Full offline mobile capability |
| Predictive Maintenance | Alert for components due for check |

---

# 10. TECHNICAL NOTES

## 10.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Backend | ERPNext |
| Frontend | Custom Dashboard |
| Hosting | ERPNext Cloud |
| Cost | £25/month |

## 10.2 Data Storage

- Location: EU (Germany)
- Compliance: GDPR, HIPAA
- Backup: Daily automatic

## 10.3 Integrations

| System | Purpose | Status |
|--------|---------|--------|
| SafetyCulture | Reports | Future |
| HSDirect | RAMS | Manual |
| QuickBooks | Accounting | Future |

---

# REVIEW CHECKLIST

Please verify the following:

- [ ] Company information is correct
- [ ] All 3 discovery calls are accurately summarized
- [ ] Job workflow matches your process
- [ ] Data fields are complete
- [ ] User roles make sense for your team
- [ ] Phase 1 deliverables cover what you need
- [ ] Priority levels are correct

**Any corrections or additions needed?**

---

**Report Prepared By:** Phanindra Reddy & Team
**Date:** March 20, 2026
**For:** LT Energy Services Ltd.

**To make corrections, please let us know.**
