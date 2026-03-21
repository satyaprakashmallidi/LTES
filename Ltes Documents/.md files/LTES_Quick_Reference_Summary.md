# LT ENERGY SERVICES - QUICK REFERENCE
## What We Are Building (Phase 1)

---

## JOB DASHBOARD (Main Screen)

| Column | Status |
|--------|--------|
| 1 | Logged Fault |
| 2 | Quote Sent |
| 3 | Approved |
| 4 | Scheduled |
| 5 | Completed |
| 6 | Invoiced |

**Features:** Drag-and-drop cards between columns

---

## CREATE JOB - PAGE 1 (Core Info)

| Field | Type |
|-------|------|
| Customer | Dropdown |
| Site | Dropdown |
| Inverter Location | Dropdown (E1, A2, etc.) |
| Inverter Model | Dropdown |
| Fault Code | Dropdown |
| Priority | High / Medium / Low |
| Issue Reported | Text |

---

## CREATE JOB - PAGE 2 (Scheduling)

| Field | Type |
|-------|------|
| Quote Number | Text |
| Purchase Order | Text |
| Scheduled Date | Date Picker |
| RAMS Status | Checkbox |
| Invoice Number | Text |
| Report Link | URL |

---

## SMART DROPDOWNS (Important!)

1. Select **Customer** → Shows only their sites
2. Select **Site** → Shows only inverters at that site
3. Select **Inverter Model** → Shows only fault codes for that model

---

## CALENDAR VIEWS

- **Today** - Jobs for today
- **Week** - Jobs this week
- **Month** - Full month view

---

## USER ROLES

| Role | Who | Can Schedule? |
|------|-----|---------------|
| Admin | Luke | Yes |
| Office | Simon | No |
| Engineer | Terry, Jason | No |

---

## PRIORITY LEVELS

| Level | Meaning |
|-------|---------|
| HIGH | Inverter not producing |
| MEDIUM | Reduced power |
| LOW | Maintenance |

---

## KEY QUOTES FROM CALLS

> "Make it so a child can use it" - Simon

> "Click, click, click, done" - Luke

---

## WHAT'S INCLUDED IN PHASE 1

- [x] Job Dashboard (Kanban)
- [x] Job Creation Form (2 pages)
- [x] Smart Dropdowns
- [x] Calendar (Day/Week/Month)
- [x] Basic Inventory View
- [x] Document Upload (RAMS, Reports)
- [x] User Roles & Permissions

---

**Last Updated:** March 2026
