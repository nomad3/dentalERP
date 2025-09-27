# Practice Manager Dashboard Wireframe

## Layout Overview
The Practice Manager Dashboard focuses on daily operational efficiency, staff coordination, and patient flow management. It provides actionable insights for day-to-day practice optimization.

## Grid Layout (Desktop 1440px+)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Header (64px height)                                                            │
│ ┌─────────────────────────┐  ┌─────────────────────────────────────────────┐   │
│ │ Today: Sept 27, 2025    │  │ Quick Actions | Alerts | Profile           │   │
│ └─────────────────────────┘  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Sidebar Navigation (280px)                  │ Main Content Area             │ │
│ │                                             │                               │ │
│ │ ┌─────────────────────────┐                │ ┌───────────────────────────┐ │ │
│ │ │ Search & Quick Access    │                │ │ Today's Overview (3x1)    │ │ │
│ │ ├─────────────────────────┤                │ └───────────────────────────┘ │ │
│ │ │ • Manager Dashboard     │                │                               │ │
│ │ │ • Today's Schedule      │                │ ┌──────────┬────────────────┐ │ │
│ │ │ • Patient Management    │                │ │Schedule  │ Patient Queue  │ │ │
│ │ │ • Staff Coordination    │                │ │Timeline  │ & Check-ins    │ │ │
│ │ │ • Resource Planning     │                │ │(2x2)     │ (1x2)         │ │ │
│ │ │ • Reports & Analytics   │                │ │          │               │ │ │
│ │ └─────────────────────────┘                │ └──────────┴────────────────┘ │ │
│ │                                             │                               │ │
│ │ ┌─────────────────────────┐                │ ┌───────────────────────────┐ │ │
│ │ │ System Status           │                │ │ Staff Performance (3x1)   │ │ │
│ │ │ 🟢 Dentrix              │                │ └───────────────────────────┘ │ │
│ │ │ 🟢 Eaglesoft            │                │                               │ │
│ │ │ 🟡 ADP (Sync)          │                │                               │ │
│ │ │ 🟢 DentalIntel          │                │                               │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Widget Layout Specifications

### Today's Overview (3x1)
Grid: 3 columns × 1 row
Gap: 16px
Height: 120px per widget

```
┌──────────────────┬──────────────────┬──────────────────┐
│ Today's Schedule │ Revenue Progress │ Staff Status     │
│                  │                  │                  │
│ 📅 32 Appts     │ 💰 $8,420       │ 👥 12 Staff      │
│ ⏰ 9 Pending     │ 🎯 78% of Goal   │ ✅ 10 Present    │
│ 🚨 2 Conflicts   │ 📈 +$340 vs Avg │ 🏠 2 Remote      │
└──────────────────┴──────────────────┴──────────────────┘
```

### Schedule Timeline (2x2)
Position: Row 2-3, Column 1-2
Dimensions: 580px × 360px

```
┌─────────────────────────────────────────────────────────────┐
│ Today's Schedule Timeline               [Reschedule] [Add]  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 8:00 AM ████████████ Dr. Johnson - Room 1              │ │
│ │         ░░░░░░░░░░░░ Mary K. - Cleaning                 │ │
│ │                                                         │ │
│ │ 9:00 AM ████████████ Dr. Martinez - Room 2             │ │
│ │         ░░░░░░░░░░░░ John D. - Root Canal              │ │
│ │                                                         │ │
│ │10:00 AM ████████████ Dr. Johnson - Room 1              │ │
│ │         ░░░░░░░░░░░░ Sarah L. - Consultation            │ │
│ │                                                         │ │
│ │11:00 AM ⚠️ CONFLICT  Dr. Martinez - Room 2             │ │
│ │         ░░░░░░░░░░░░ Tom R. - OVERLAPPING BOOKING       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ⚠️ 2 Scheduling Conflicts  |  📞 3 Confirmations Needed     │
└─────────────────────────────────────────────────────────────┘
```

### Patient Queue & Check-ins (1x2)
Position: Row 2-3, Column 3
Dimensions: 280px × 360px

```
┌─────────────────────────────────────┐
│ Patient Queue           [Refresh]   │
│ ┌─────────────────────────────────┐ │
│ │ 🟢 CHECKED IN                   │ │
│ │ Mary K. - 8:30 AM               │ │
│ │ Room 1 • Cleaning               │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│ │ 🟡 WAITING                      │ │
│ │ John D. - 9:15 AM               │ │
│ │ Room 2 • Root Canal             │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│ │ 🔴 LATE                         │ │
│ │ Sarah L. - 10:00 AM             │ │
│ │ Room 1 • Consultation           │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│ │ ⏰ UPCOMING                     │ │
│ │ Tom R. - 11:30 AM               │ │
│ │ Room 2 • Follow-up              │ │
│ └─────────────────────────────────┘ │
│ Average Wait: 12 min               │ │
└─────────────────────────────────────┘
```

### Staff Performance Overview (3x1)
Position: Row 4, Column 1-3
Dimensions: 880px × 180px

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Staff Performance Dashboard                                       [View All]     │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🏆 Dr. Johnson      💰 $2,840    ⏱️ 94%     📅 6/6 Appts   ⭐ 4.9         │ │
│ │ 🥈 Dr. Martinez     💰 $2,650    ⏱️ 89%     📅 5/6 Appts   ⭐ 4.8         │ │
│ │ 🥉 Sarah (Hygienist) 💰 $540     ⏱️ 92%     📅 8/8 Slots   ⭐ 4.9         │ │
│ │ 📊 Team Average     💰 $1,343    ⏱️ 91.7%   📅 19/20       ⭐ 4.87        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ 🎯 Daily Goal: $9,500 (88.6% achieved)  |  ⚠️ 1 staff member behind target      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Action Panel & Quick Functions

### Quick Actions Toolbar
Position: Top right header
```
┌─────────────────────────────────────────────────────────────┐
│ [📋 New Appointment] [👥 Check-In] [📞 Patient Call] [📊]   │
└─────────────────────────────────────────────────────────────┘
```

### Alert Center
Position: Expandable panel from header
```
┌─────────────────────────────────────────────────────────────┐
│ 🚨 Priority Alerts                                  [×]     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ⚠️  Schedule conflict: Room 2 at 11:00 AM                   │
│ 📞  3 appointment confirmations needed                       │
│ 💊  Prescription renewal required - Patient ID #1847        │
│ 🔧  Equipment maintenance due - Sterilizer #3               │
│ 💰  Insurance pre-authorization expired - John D.           │
└─────────────────────────────────────────────────────────────┘
```

### Patient Information Panel
Slides in from right when patient selected
```
┌─────────────────────────────────────────────────────────────┐
│ 👤 John Doe                                         [×]     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 📞 (555) 123-4567  |  📧 john.doe@email.com               │
│ 🎂 DOB: 1985-03-15  |  🏠 123 Main St, City, State        │
│                                                             │
│ 📋 Today's Appointment: 9:15 AM - Root Canal              │
│ 🦷 Treatment: #14 Endodontic therapy                       │
│ 💊 Pre-med: Ibuprofen 600mg (taken)                       │
│ 📝 Notes: Patient anxious, prefers nitrous                 │
│                                                             │
│ 💳 Insurance: Delta Dental - Active                        │
│ 💰 Est. Patient Portion: $285                             │
│                                                             │
│ [📝 Update Notes] [💊 Prescriptions] [📋 History]          │
└─────────────────────────────────────────────────────────────┘
```

## Resource Management Widgets

### Equipment Status (1x1)
```
┌─────────────────────────────────┐
│ Equipment Status    [Details]   │
│ ┌─────────────────────────────┐ │
│ │ 🟢 X-Ray Machine #1         │ │
│ │ 🟢 Sterilizer #1           │ │
│ │ 🟡 Sterilizer #2 (Service) │ │
│ │ 🟢 Compressor              │ │
│ │ 🔴 Chair #3 (Repair)       │ │
│ └─────────────────────────────┘ │
│ 4/5 Operational (80%)          │
└─────────────────────────────────┘
```

### Room Utilization (1x1)
```
┌─────────────────────────────────┐
│ Room Utilization    [Optimize] │
│ ┌─────────────────────────────┐ │
│ │ Room 1 ████████████ 85%     │ │
│ │ Room 2 ██████████░░ 72%     │ │
│ │ Room 3 ██████░░░░░░ 45%     │ │
│ │ Surgery ████░░░░░░ 38%      │ │
│ │ Hygiene ████████░░░ 68%     │ │
│ └─────────────────────────────┘ │
│ Avg: 61.6% | Target: 75%      │
└─────────────────────────────────┘
```

## Responsive Adaptations

### Tablet (768px - 1199px)
- Schedule timeline becomes scrollable list
- Patient queue moves below schedule
- Staff performance condenses to key metrics
- Touch-optimized patient check-in buttons

### Mobile (< 768px)
- Card-based layout for all widgets
- Swipe gestures for patient queue management
- Floating action button for quick appointments
- Simplified alert notifications

## Integration Features

### Dentrix Integration
- Real-time appointment synchronization
- Patient chart access and updates
- Treatment plan status tracking
- Insurance verification integration

### Eaglesoft Integration
- Schedule conflict detection
- Patient communication history
- Treatment completion tracking
- Revenue recognition updates

### ADP Integration
- Staff clock-in/out status
- Payroll hours tracking
- Performance metrics correlation
- Time-off request approvals

### DentalIntel Integration
- Patient satisfaction scores
- Operational efficiency benchmarks
- Staff performance analytics
- Revenue optimization suggestions

## Workflow Automation

### Smart Scheduling
- Automatic conflict detection
- Suggested reschedule options
- Buffer time management
- Patient preference matching

### Communication Automation
- Appointment reminders (SMS/Email)
- Confirmation request triggers
- Post-treatment follow-ups
- Insurance claim status updates

### Staff Coordination
- Automatic room assignments
- Break schedule optimization
- Task distribution balancing
- Emergency coverage protocols

## Accessibility & Usability

### Keyboard Shortcuts
- `Space`: Check-in selected patient
- `R`: Refresh current view
- `N`: New appointment
- `F`: Find patient
- `Esc`: Close panels/dialogs

### Color-Coding System
- 🟢 Green: On-time, operational, good
- 🟡 Yellow: Warning, attention needed
- 🔴 Red: Critical, late, broken
- 🔵 Blue: Information, pending
- 🟣 Purple: Priority, VIP patients

### Touch Interactions
- Swipe left on patient: Quick actions
- Long press on appointment: Context menu
- Pull to refresh on lists
- Pinch to zoom on timeline view

## Performance & Real-time Updates

### Data Refresh Rates
- Patient queue: Every 30 seconds
- Schedule conflicts: Real-time
- Staff status: Every 2 minutes
- Revenue metrics: Every 5 minutes

### Offline Capabilities
- Patient check-in functionality
- Basic appointment viewing
- Critical alert notifications
- Emergency contact information
