# Executive Dashboard Wireframe

## Layout Overview
The Executive Dashboard provides high-level strategic insights across all practice locations, featuring KPI summaries, performance analytics, and market intelligence in a clean, scannable layout.

## Grid Layout (Desktop 1440px+)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Header (64px height)                                                            │
│ ┌─────────────────────────┐  ┌─────────────────────────────────────────────┐   │
│ │ Breadcrumb              │  │ User Menu | Notifications | Settings       │   │
│ └─────────────────────────┘  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Sidebar Navigation (280px)                                                  │ │
│ │                                                           │ Main Content    │ │
│ │ ┌─────────────────────────┐                              │ Area            │ │
│ │ │ Logo & Search           │                              │                 │ │
│ │ ├─────────────────────────┤                              │ ┌─────────────┐ │ │
│ │ │ • Executive Dashboard   │                              │ │   KPI Row   │ │ │
│ │ │ • Performance Analytics │                              │ │ (4 widgets) │ │ │
│ │ │ • Financial Reports     │                              │ └─────────────┘ │ │
│ │ │ • Multi-Location View   │                              │                 │ │
│ │ │ • Staff Overview        │                              │ ┌─────────────┐ │ │
│ │ │ • Market Intelligence   │                              │ │ Revenue     │ │ │
│ │ └─────────────────────────┘                              │ │ Chart       │ │ │
│ └─────────────────────────────────────────────────────────────┘ │ (2x2)       │ │ │
│                                                           │ └─────────────┘ │ │
│                                                           │                 │ │
│                                                           │ ┌─────────────┐ │ │
│                                                           │ │ Location    │ │ │
│                                                           │ │ Performance │ │ │
│                                                           │ │ (2x2)       │ │ │
│                                                           │ └─────────────┘ │ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Widget Layout Specifications

### KPI Row (Top Section)
Grid: 4 columns × 1 row
Gap: 24px
Height: 140px per widget

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Revenue│ Patient      │ Appointment  │ Profit       │
│              │ Volume       │ Efficiency   │ Margin       │
│ $2.4M        │              │              │              │
│ ↑ 12.5%      │ 15,847       │ 94.2%        │ 28.3%        │
│              │ ↑ 8.3%       │ ↑ 2.1%       │ ↓ 0.8%       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Revenue Analytics Chart (2x2)
Position: Row 2-3, Column 1-2
Dimensions: 580px × 360px

```
┌─────────────────────────────────────────────────────────────┐
│ Revenue Trends                                  [•••]      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │     ╭─────╮                                             │ │
│ │    ╱       ╲        ╭───╮                               │ │
│ │   ╱         ╲      ╱     ╲                              │ │
│ │  ╱           ╲    ╱       ╲                             │ │
│ │ ╱             ╲  ╱         ╲                            │ │
│ │╱               ╲╱           ╲                           │ │
│ │ Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 📊 YTD: $2.4M  📈 Growth: 12.5%  🎯 Goal: $3.2M           │
└─────────────────────────────────────────────────────────────┘
```

### Location Performance Matrix (2x2)
Position: Row 2-3, Column 3-4
Dimensions: 580px × 360px

```
┌─────────────────────────────────────────────────────────────┐
│ Multi-Location Performance              [Filter] [Export]  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Location          Revenue    Patients   Efficiency      │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│ │ 🏢 Downtown       $420K ↑   2,847 ↑   96.2% 🟢        │ │
│ │ 🏢 Westside       $385K ↑   2,634 →   94.8% 🟡        │ │
│ │ 🏢 Northgate      $362K ↓   2,491 ↓   89.3% 🔴        │ │
│ │ 🏢 Riverside      $341K ↑   2,156 ↑   91.7% 🟡        │ │
│ │ 🏢 Suburban       $298K →   1,983 →   93.1% 🟢        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 🎯 Best Performer: Downtown  ⚠️ Needs Attention: Northgate  │
└─────────────────────────────────────────────────────────────┘
```

### Patient Acquisition Trends (1x2)
Position: Row 4, Column 1-2
Dimensions: 580px × 180px

```
┌─────────────────────────────────────────────────────────────┐
│ Patient Acquisition                             [•••]      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ New: 347  Returning: 1,205  Referrals: 89              │ │
│ │ ████████████████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │ │
│ │ Marketing ROI: 3.2x  │  Conversion Rate: 68.4%         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Staff Productivity Overview (1x2)
Position: Row 4, Column 3-4
Dimensions: 580px × 180px

```
┌─────────────────────────────────────────────────────────────┐
│ Staff Productivity                              [•••]      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👥 Total Staff: 47  ⭐ Top Performers: 8  📈 Avg: 94.2% │ │
│ │ 🏆 Dr. Johnson    💰 Revenue/Hr: $285    ⏱️ Utilization  │ │
│ │ 🥈 Dr. Martinez   💰 Revenue/Hr: $271    ⏱️ 96.8%        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Interactive Elements

### Filter Bar
Position: Below KPI row
```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Last 30 Days ▼  |  📍 All Locations ▼  |  🔍 Compare    │
└─────────────────────────────────────────────────────────────┘
```

### Action Buttons
- **Export Reports**: Generate executive summary PDFs
- **Schedule Review**: Book performance review meetings
- **Set Goals**: Modify practice targets
- **View Details**: Drill down into specific metrics

### Notification Center
```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 Notifications                                    [×]     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ⚠️  Northgate location performance below target             │
│ 📈  Monthly revenue goal achieved (102.3%)                  │
│ 👥  3 new staff performance reviews available               │
│ 📊  Weekly executive report ready for review                │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Adaptations

### Tablet (768px - 1199px)
- KPI widgets stack in 2×2 grid
- Charts resize to maintain aspect ratios
- Sidebar collapses by default
- Touch-friendly controls

### Mobile (< 768px)
- Single column layout
- KPIs become horizontal cards
- Charts adapt to mobile-optimized versions
- Pull-to-refresh functionality

## Data Integration Sources

### Dentrix Integration
- Patient appointment data
- Treatment completion rates
- Revenue per patient visit

### DentalIntel Integration
- Practice performance benchmarks
- Market analysis data
- Competitive insights

### ADP Integration
- Staff productivity metrics
- Payroll efficiency data
- Labor cost analysis

### Eaglesoft Integration
- Financial reporting data
- Insurance claim processing
- Treatment plan analytics

## Accessibility Features

### WCAG 2.1 AA Compliance
- High contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Screen reader optimization
- Alternative text for charts

### Keyboard Shortcuts
- `Ctrl/Cmd + R`: Refresh dashboard
- `Ctrl/Cmd + F`: Focus search
- `Ctrl/Cmd + 1-4`: Navigate to KPI widgets
- `Tab`: Navigate through interactive elements

### Focus Management
- Clear focus indicators on all interactive elements
- Logical tab order throughout dashboard
- Skip links for screen reader users

## Performance Specifications
- Initial load time: < 2 seconds
- Widget refresh rate: Real-time for critical metrics
- Data cache duration: 5 minutes for KPIs
- Chart rendering: Progressive enhancement with fallbacks
