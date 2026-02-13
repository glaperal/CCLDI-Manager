# CCLDI Student Management System (CSMS)

## Overview
Production-ready, single-file HTML5 prototype for managing 16 CCLDI locations (11 Corporate Centers + 5 Franchises) with high-velocity oversight capabilities.

## Design Philosophy
**Ultra-minimalist. First Principles. Operational Clarity over Aesthetic Complexity.**

- White background (#FFFFFF)
- Black buttons (#000000) with White text (#FFFFFF)
- No external dependencies
- Pure Vanilla JavaScript and CSS

## Features

### 1. Global Ecosystem Dashboard
- **Center Selector**: Switch between all 16 locations or view consolidated data
- **KPI Tiles**:
  - Total Enrollment across all centers
  - System Capacity % utilization
  - Accounts Receivable (AR) in PHP
  - Monthly Revenue from tuition
- **Center Performance Overview**: Individual cards for each center showing enrollment, capacity, and AR metrics

### 2. Student Ledger
- **CRUD Operations**: Create, Read, Update, Delete student profiles
- **Student Information**: Name, Age, Gender, Parent/Guardian, Contact, Email, Center Assignment, Monthly Tuition
- **Search & Filter**: Real-time search and center-based filtering
- **Payment Status**: Visual indicators for outstanding balances

### 3. Financial Dashboard (Billing)
- **Payment Recording**: Log tuition and miscellaneous fee payments
- **Aging Report**: Track outstanding balances categorized by age:
  - Current (0-30 days)
  - 1-30 Days overdue
  - 31-60 Days overdue
  - 60+ Days overdue
- **Value-Investing Metrics**: Focus on AR efficiency and cash flow optimization

### 4. Pre-Mortem Warning System
Automatic alerts for:
- Centers with **< 70% capacity** (configurable threshold)
- Centers with **> 10% AR outstanding** (configurable threshold)
- Visual red highlighting for at-risk centers

### 5. Settings
- Adjustable warning thresholds
- System information and statistics
- About section

## File Structure
```
CCLDI-Student-Management-System/
├── index.html          # Complete single-file application
└── README.md           # This file
```

## How to Use

### Opening the Application
1. Navigate to the folder: `C:\Users\ADMIN\CCLDI-Student-Management-System\`
2. Double-click `index.html` to open in your default web browser
3. OR right-click → Open with → Choose your preferred browser

### Navigation
- **Sidebar**: Click Dashboard, Students, Billing, or Settings to switch views
- **Top Bar Center Selector**: Filter data by specific center or view all centers
- **User Profile**: Shows current user role (President)

### Managing Students
1. Click **Students** in the sidebar
2. Click **Add Student** button
3. Fill in student details and click **Save Student**
4. Use **Edit** to modify existing students
5. Use **Delete** to deactivate students (soft delete)
6. Use search box to find students quickly

### Recording Payments
1. Click **Billing** in the sidebar
2. Click **Record Payment** button
3. Select student, payment type, amount, and date
4. Click **Record Payment** to save
5. View updated aging report automatically

### Adjusting Thresholds
1. Click **Settings** in the sidebar
2. Modify **Capacity Warning Threshold** (default: 70%)
3. Modify **AR Warning Threshold** (default: 10%)
4. Changes apply immediately to dashboard warnings

## Pre-Loaded Data

### Centers (16 Total)
**Corporate Centers (11):**
- Alabang (120 capacity)
- Makati Legaspi (100 capacity)
- Makati Salcedo (90 capacity)
- Ortigas (110 capacity)
- BGC (130 capacity)
- QC Eastwood (95 capacity)
- QC Vertis North (105 capacity)
- Pasig (85 capacity)
- Mandaluyong (100 capacity)
- Paranaque (80 capacity)
- Taguig (90 capacity)

**Franchises (5):**
- Cebu (150 capacity)
- Davao (140 capacity)
- Baguio (100 capacity)
- Iloilo (110 capacity)
- Cagayan de Oro (120 capacity)

### Sample Data
- **25 Active Students** distributed across all centers
- **13 Payment Records** for demonstration
- Realistic Filipino names and contact information

## Technical Specifications

### Browser Compatibility
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

### Data Persistence
**Important**: This is a prototype using in-memory data storage. All changes are lost when you refresh the page. For production use, integrate with a backend database.

### Performance
- Single-file architecture: ~52KB uncompressed
- No external API calls or CDN dependencies
- Instant page navigation (no reloads)
- Responsive design for various screen sizes

## Key Metrics & Calculations

### Capacity Percentage
```
Capacity % = (Total Enrolled Students / Total Capacity) × 100
```

### Accounts Receivable (AR)
```
Expected Revenue = Monthly Tuition × Months Since Enrollment
Total Paid = Sum of all payment records for student
Outstanding AR = Expected Revenue - Total Paid
AR % = (Total Outstanding / Total Expected Revenue) × 100
```

### Aging Buckets
- **Current**: Enrolled < 1 month ago
- **1-30 Days**: Enrolled 1 month ago
- **31-60 Days**: Enrolled 2 months ago
- **60+ Days**: Enrolled 3+ months ago

## Value-Investing Principles Applied

1. **Capital Efficiency**: AR tracking shows capital locked in operations
2. **Pre-Mortem Analysis**: Proactive warning system prevents problems before they escalate
3. **Operational Clarity**: Simple, direct metrics for decision-making
4. **Margin of Safety**: Warning thresholds create buffer zones for intervention

## Future Enhancement Roadmap

To convert this prototype to production:

1. **Backend Integration**: Connect to database (PostgreSQL/MySQL)
2. **Authentication**: Multi-role login (President, Manager, Staff)
3. **Data Export**: PDF reports and Excel exports
4. **Analytics**: Charts and trend visualizations
5. **Notifications**: Email/SMS alerts for overdue payments
6. **Mobile App**: Native iOS/Android applications
7. **API**: RESTful API for third-party integrations
8. **Attendance Module**: Daily attendance tracking
9. **Teacher Management**: Staff assignments and scheduling
10. **Parent Portal**: Self-service payment and updates

## Support & Maintenance

### Troubleshooting
- **Blank Screen**: Check browser console for JavaScript errors
- **Data Not Saving**: Remember, this is a prototype - data resets on refresh
- **Layout Issues**: Ensure browser is up to date and window is at least 1024px wide

### Customization
To modify the system, edit `index.html`:
- **Colors**: Search for `#000000`, `#FFFFFF`, `#FF0000` in the `<style>` section
- **Data**: Modify the `CCLDI_DATABASE` object in the `<script>` section
- **Layout**: Adjust CSS grid and flexbox properties

## Version
**1.0.0** - Initial Production Prototype

## License
Proprietary - CCLDI Internal Use Only

---

**Built with First Principles for High-Velocity Decision Making**
