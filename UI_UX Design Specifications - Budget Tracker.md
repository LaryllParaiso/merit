# UI/UX Design Specifications
## Simple Budget Tracker for Junior High School Students

---

## Overview

This document contains comprehensive UI/UX design specifications for the Simple Budget Tracker mobile app. Use this as a reference when implementing the user interface and user experience.

**Target Users:** Junior high school students (Grades 7-10)  
**Platform:** Android mobile app (Ionic Angular)  
**Design Philosophy:** Youth-friendly, simple, engaging, and encouraging

---

## Design Principles

### Core Principles
1. **Simplicity First:** Minimal cognitive load with clear visual hierarchy
2. **Youth-Friendly:** Engaging colors and modern interface appealing to teenagers
3. **Immediate Feedback:** Real-time validation and confirmation messages
4. **Visual Learning:** Heavy use of icons, colors, and charts over text
5. **Encouraging Tone:** Positive reinforcement for good financial habits

### Design Goals
- Make financial tracking feel effortless and engaging
- Use visual cues to teach financial awareness
- Celebrate positive behaviors and progress
- Reduce friction in data entry
- Make insights immediately clear and actionable

---

## Color Palette

### Primary Colors
```css
--primary: #4A90E2;        /* Blue - Trust and stability */
--secondary: #52C41A;      /* Green - Savings and positive balance */
--accent: #FA8C16;         /* Orange - Warnings and attention */
--danger: #F5222D;         /* Red - Overspending alerts */
```

### Neutral Colors
```css
--background: #F5F5F5;     /* Light gray background */
--card-bg: #FFFFFF;        /* White for cards */
--text-primary: #333333;   /* Dark gray for primary text */
--text-secondary: #666666; /* Medium gray for secondary text */
--text-tertiary: #999999;  /* Light gray for hints/captions */
--border: #E0E0E0;         /* Border color */
```

### Semantic Colors
```css
--success: #52C41A;        /* Success messages, positive balance */
--warning: #FA8C16;        /* Warning messages, approaching limits */
--error: #F5222D;          /* Error messages, overspending */
--info: #1890FF;           /* Informational messages */
```

### Budget Status Colors
```css
--budget-safe: #52C41A;    /* Under 70% spent - Green */
--budget-caution: #FADB14; /* 70-90% spent - Yellow */
--budget-warning: #FA8C16; /* 90-100% spent - Orange */
--budget-danger: #F5222D;  /* Over 100% spent - Red */
```

### Color Usage Guidelines
- **Primary Blue:** Main actions, headers, selected states
- **Green:** Income, savings, positive outcomes, safe budgets
- **Orange:** Warnings, approaching limits, needs attention
- **Red:** Expenses, overspending, errors, critical alerts
- **White Cards:** All content containers on gray background
- **Text Hierarchy:** Dark for primary, medium for secondary, light for tertiary

---

## Typography

### Font Family
```css
--font-primary: 'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Why Roboto/Inter:**
- Clean and modern appearance
- Highly readable at small sizes
- Wide range of weights available
- Optimized for digital screens
- Professional yet friendly

### Font Scale
```css
--font-size-h1: 24px;      /* Main headings - Bold (700) */
--font-size-h2: 20px;      /* Section headings - Semibold (600) */
--font-size-h3: 18px;      /* Subsection headings - Medium (500) */
--font-size-body: 16px;    /* Body text - Regular (400) */
--font-size-caption: 14px; /* Captions, labels - Regular (400) */
--font-size-small: 12px;   /* Small labels, hints - Regular (400) */
```

### Font Weights
```css
--font-weight-bold: 700;      /* Headings, emphasis */
--font-weight-semibold: 600;  /* Subheadings */
--font-weight-medium: 500;    /* Highlighted text */
--font-weight-regular: 400;   /* Body text */
```

### Line Height
```css
--line-height-tight: 1.2;     /* Headings */
--line-height-normal: 1.5;    /* Body text */
--line-height-relaxed: 1.75;  /* Long-form content */
```

### Typography Examples
```css
/* Page Title */
h1 {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: #333333;
  margin-bottom: 16px;
}

/* Section Heading */
h2 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: #333333;
  margin-bottom: 12px;
}

/* Body Text */
body {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #333333;
}

/* Caption/Label */
.caption {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #666666;
}

/* Amount Display (Special) */
.amount {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
```

---

## Spacing System

### Base Unit: 4px

```css
--space-xs: 4px;      /* Minimal spacing */
--space-sm: 8px;      /* Small spacing, tight groups */
--space-md: 16px;     /* Default spacing between elements */
--space-lg: 24px;     /* Large spacing, section separators */
--space-xl: 32px;     /* Extra large, major sections */
--space-xxl: 48px;    /* Maximum spacing */
```

### Component Spacing
- **Card padding:** 16px (--space-md)
- **Screen padding:** 16px horizontal, 24px vertical
- **List item spacing:** 12px vertical
- **Form field spacing:** 16px vertical
- **Button padding:** 12px vertical, 24px horizontal
- **Minimum touch target:** 44px × 44px

---

## Navigation Structure

### Bottom Tab Navigation (5 Tabs)

```
┌─────────────────────────────────────┐
│                                     │
│         MAIN CONTENT AREA           │
│                                     │
├─────────────────────────────────────┤
│ [🏠] [📄] [➕] [💰] [📊]           │
│ Home  Trans Add  Budget Reports     │
└─────────────────────────────────────┘
```

**Tab Specifications:**

1. **Home (Dashboard)**
   - Icon: `ion-icon name="home"`
   - Label: "Home"
   - Color: Primary when active
   - Route: `/dashboard`

2. **Transactions**
   - Icon: `ion-icon name="list"`
   - Label: "Transactions"
   - Color: Primary when active
   - Route: `/transactions`

3. **Add (Center FAB)**
   - Icon: `ion-icon name="add-circle"`
   - Label: "Add"
   - Style: Larger, elevated button
   - Color: Primary
   - Action: Opens quick add menu or modal

4. **Budget**
   - Icon: `ion-icon name="wallet"`
   - Label: "Budget"
   - Color: Primary when active
   - Route: `/budget`

5. **Reports**
   - Icon: `ion-icon name="bar-chart"`
   - Label: "Reports"
   - Color: Primary when active
   - Route: `/reports`

### Navigation Behavior
- Active tab highlighted with primary color
- Inactive tabs in gray (#999999)
- Smooth transition between tabs (300ms)
- Center FAB slightly elevated above other tabs
- Tab bar fixed at bottom, always visible

---

## Screen Layouts & User Flows

### 1. Onboarding Flow (First-time Users)

#### Welcome Screen
```
┌─────────────────────────────────────┐
│                                     │
│     [Illustration/Logo Image]       │
│                                     │
│    Welcome to Budget Tracker!       │
│                                     │
│   Learn to manage your money        │
│   and achieve your goals            │
│                                     │
│         [Get Started →]             │
│         [Skip for now]              │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Full-screen layout
- Welcoming illustration (coins, piggy bank, etc.)
- Large heading (24px, bold)
- Descriptive subtitle (16px, regular)
- Primary CTA button (Get Started)
- Secondary skip link

#### Feature Highlights (3-4 Slides)

**Slide 1: Track Expenses**
```
┌─────────────────────────────────────┐
│                                     │
│     [Icon/Illustration]             │
│                                     │
│      Track Your Expenses            │
│                                     │
│   Easily record where your          │
│   money goes every day              │
│                                     │
│         ● ○ ○ ○                    │
│                                     │
│              [Next →]               │
└─────────────────────────────────────┘
```

**Slide 2: Set Budgets**
**Slide 3: Achieve Goals**
**Slide 4: View Reports**

**Elements:**
- Swipeable carousel
- Progress dots at bottom
- Next/Skip buttons
- Simple illustrations for each feature

#### Profile Setup
```
┌─────────────────────────────────────┐
│                                     │
│      Let's Set Up Your Profile      │
│                                     │
│   What's your name?                 │
│   ┌─────────────────────────────┐   │
│   │ [Name Input]                │   │
│   └─────────────────────────────┘   │
│                                     │
│   What grade are you in? (Optional)│
│   ┌─────────────────────────────┐   │
│   │ [Grade 7 ▼]                 │   │
│   └─────────────────────────────┘   │
│                                     │
│         [Continue →]                │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Clean form layout
- Optional fields clearly marked
- Large input fields (easy to tap)
- Primary CTA button at bottom

#### Initial Budget Setup (Optional Quick Wizard)
```
┌─────────────────────────────────────┐
│                                     │
│    Set Your First Budget            │
│                                     │
│   Category: Food                    │
│   Weekly Limit: ₱ [500]             │
│                                     │
│   Category: Transportation          │
│   Weekly Limit: ₱ [200]             │
│                                     │
│         [Add Budget]                │
│         [Skip for now]              │
│                                     │
└─────────────────────────────────────┘
```

---

### 2. Dashboard (Home Screen)

```
┌─────────────────────────────────────┐
│ ☰  Dashboard                    🔔  │ ← Header
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │   Current Balance               │ │
│ │   ₱ 2,450.00                    │ │ ← Balance Card
│ │   ↑ Income: ₱3,000              │ │
│ │   ↓ Spent: ₱550                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Today's Spending                │ │
│ │ ₱ 125.00  •  3 transactions     │ │ ← Today Summary
│ └─────────────────────────────────┘ │
│                                     │
│ Budget Status                       │
│ ┌───────────┐ ┌───────────┐       │
│ │ 🍔 Food   │ │ 🚌 Trans  │       │
│ │ ₱250/500  │ │ ₱80/200   │       │ ← Budget Cards
│ │ ████░░ 50%│ │ ███░░░ 40%│       │
│ └───────────┘ └───────────┘       │
│                                     │
│ Recent Transactions                 │
│ ┌─────────────────────────────────┐ │
│ │ 🍔 Lunch        -₱ 50.00        │ │
│ │ 🚌 Jeepney      -₱ 13.00        │ │ ← Transaction List
│ │ 💰 Allowance    +₱ 100.00       │ │
│ └─────────────────────────────────┘ │
│ [View All →]                        │
│                                     │
│ Savings Goals                       │
│ ┌─────────────────────────────────┐ │
│ │ 📱 New Phone                    │ │
│ │ ₱2,500 / ₱5,000                 │ │ ← Goal Progress
│ │ ██████████░░░░░░░░░ 50%         │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
│ [🏠] [📄] [➕] [💰] [📊]           │ ← Bottom Nav
└─────────────────────────────────────┘
```

#### Dashboard Components

**Header Bar**
- Menu icon (left) - Opens settings/profile
- Page title "Dashboard"
- Notification bell (right) - Shows alerts
- Height: 56px
- Background: White with bottom shadow

**Balance Card (Primary Focus)**
```
┌─────────────────────────────────────┐
│   Current Balance                   │
│   ₱ 2,450.00                        │ ← Large, bold (32px)
│   ↑ Income: ₱3,000  ↓ Spent: ₱550  │ ← Green/Red
└─────────────────────────────────────┘
```
- Prominent position at top
- Large amount display (32px, bold)
- Green for positive, red for negative balance
- Income in green with up arrow
- Expenses in red with down arrow
- Card background: White
- Padding: 24px
- Border radius: 12px
- Shadow: subtle elevation

**Today's Spending Summary**
```
┌─────────────────────────────────────┐
│ Today's Spending                    │
│ ₱ 125.00  •  3 transactions         │
└─────────────────────────────────────┘
```
- Quick glance at today's activity
- Amount and transaction count
- Updates in real-time
- Tappable to view today's details

**Budget Status Cards (Grid Layout)**
```
┌───────────────┐ ┌───────────────┐
│ 🍔 Food       │ │ 🚌 Transport  │
│ ₱250 / 500    │ │ ₱80 / 200     │
│ ████████░░    │ │ ██████░░░░    │
│ 50% • Safe    │ │ 40% • Safe    │
└───────────────┘ └───────────────┘
```
- 2-column grid on mobile
- Category icon (large, colorful)
- Spent / Limit amount
- Progress bar (color-coded)
- Percentage and status label
- Color changes based on spending:
  - Green: < 70%
  - Yellow: 70-90%
  - Orange: 90-100%
  - Red: > 100%

**Recent Transactions (Preview)**
```
┌─────────────────────────────────────┐
│ 🍔 Lunch            -₱ 50.00  12:30 │
│ 🚌 Jeepney fare     -₱ 13.00  08:15 │
│ 💰 Weekly allowance +₱ 100.00 Mon   │
└─────────────────────────────────────┘
[View All →]
```
- Last 5 transactions
- Category icon
- Description
- Amount (red for expense, green for income)
- Time/date
- View All link navigates to full list

**Savings Goals Progress**
```
┌─────────────────────────────────────┐
│ 📱 New Phone                        │
│ ₱2,500 / ₱5,000                     │
│ ████████████░░░░░░░░░ 50%           │
│ Target: March 1, 2025               │
└─────────────────────────────────────┘
```
- Active goals displayed
- Goal name with icon
- Current / Target amount
- Animated progress bar
- Target date
- Tappable to view goal details

**Floating Action Buttons (FAB)**
```
                [➕]
           ↙          ↘
      [Expense]    [Income]
```
- Primary FAB: Large add button (56px)
- Expands to show Expense/Income options
- Position: Bottom right, above tab bar
- Color: Primary blue
- Shadow: elevated (8dp)
- Animation: Rotate and expand on tap

**Pull-to-Refresh**
- Pull down from top to refresh all data
- Loading spinner appears
- Smooth animation
- Success feedback

**Interactions:**
- Tap balance card → View detailed transaction history
- Tap budget card → View budget details
- Tap transaction → View/edit transaction
- Tap goal → View/edit goal
- Tap "View All" → Navigate to full lists
- Pull down → Refresh data

---

### 3. Add Transaction Screen

#### Add Expense Layout
```
┌─────────────────────────────────────┐
│ ← Add Expense                    ✓  │ ← Header with back/save
├─────────────────────────────────────┤
│                                     │
│          ₱ 0.00                     │ ← Amount Display (large)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │   7    8    9                   │ │
│ │   4    5    6                   │ │ ← Number Pad
│ │   1    2    3                   │ │
│ │   .    0    ⌫                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Category                            │
│ < 🍔  🚌  📚  🎮  🏀  ➕ >         │ ← Horizontal Scroll
│  Food Trans School Play Sports      │
│                                     │
│ Date                                │
│ ┌─────────────────────────────────┐ │
│ │ 📅 Today, Jan 9, 2025      ▼   │ │ ← Date Picker
│ └─────────────────────────────────┘ │
│                                     │
│ Notes (Optional)                    │
│ ┌─────────────────────────────────┐ │
│ │ Add a note...                   │ │ ← Collapsible Note Field
│ └─────────────────────────────────┘ │
│                                     │
│        [Save Expense]               │ ← Primary Action Button
│                                     │
└─────────────────────────────────────┘
```

**Component Details:**

**Amount Input**
- Large display (48px, bold)
- Currency symbol (₱)
- Auto-focus on screen load
- Real-time validation
- Maximum: 999,999.99

**Number Pad**
- Custom design matching app theme
- Large buttons (easy to tap)
- Grid layout: 4 rows × 3 columns
- Includes decimal point
- Backspace button
- Haptic feedback on tap (optional)

**Category Selector**
```
< 🍔    🚌    📚    🎮    🏀    ➕ >
  Food  Trans School Play Sports Add
```
- Horizontal scrollable list
- Large icons (48px × 48px)
- Icon + label below
- Selected state: Primary color background
- Unselected: Gray background
- "Add" option to create custom category
- Quick access to recent categories

**Date Picker**
```
┌─────────────────────────────────────┐
│ 📅 Today, Jan 9, 2025          ▼   │
└─────────────────────────────────────┘
```
- Defaults to today
- Tap to open calendar modal
- Quick options: Today, Yesterday, This Week
- Calendar view for custom date
- Clear visual indicator of selected date

**Notes Field (Collapsible)**
```
┌─────────────────────────────────────┐
│ Notes (Optional)                 ▼  │
└─────────────────────────────────────┘

↓ (When expanded)

┌─────────────────────────────────────┐
│ Notes (Optional)                 ▲  │
├─────────────────────────────────────┤
│ School lunch with friends...        │
│                                     │
└─────────────────────────────────────┘
```
- Collapsed by default to reduce clutter
- Tap to expand
- Multi-line text input
- Character limit: 200

**Save Button**
```
┌─────────────────────────────────────┐
│         Save Expense                │
└─────────────────────────────────────┘
```
- Full width at bottom
- Primary color
- Disabled state (gray) when invalid
- Loading state with spinner
- Height: 48px
- Fixed position (stays visible when scrolling)

**Form Validation:**
- Amount must be > 0
- Category must be selected
- Date cannot be in future
- Real-time error messages
- Disable save button when invalid

**UX Enhancements:**
- Auto-focus on amount field
- Remember last used category
- Smart date suggestions based on time of day
- Swipe right to cancel/go back
- Confirmation dialog if amount is unusually large

#### Add Income Screen
- Same layout as Add Expense
- Header: "Add Income" (green accent)
- Categories: Allowance, Gift, Earnings, Other
- Same number pad and date picker
- Green save button instead of blue
- Income amount shows in green

---

### 4. Transactions List Screen

```
┌─────────────────────────────────────┐
│ ← Transactions              🔍 ⋮    │ ← Header with search/filter
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search transactions...       │ │ ← Search Bar
│ └─────────────────────────────────┘ │
│                                     │
│ [All] [Income] [Expense] [Today]▼  │ ← Filter Chips
│                                     │
│ Today - Jan 9, 2025                 │ ← Date Separator
│ ┌─────────────────────────────────┐ │
│ │ 🍔│ Lunch         12:30 PM       │ │
│ │   │ Food                -₱ 50.00││ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🚌│ Jeepney       8:15 AM        │ │
│ │   │ Transport           -₱ 13.00││ │
│ └─────────────────────────────────┘ │
│                                     │
│ Yesterday - Jan 8, 2025             │
│ ┌─────────────────────────────────┐ │
│ │ 💰│ Allowance     9:00 AM        │ │
│ │   │ Income             +₱ 500.00││ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📚│ Notebook      2:30 PM        │ │
│ │   │ School             -₱ 35.00 ││ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Load More...]                      │
│                                     │
└─────────────────────────────────────┘
```

**Component Details:**

**Search Bar**
```
┌─────────────────────────────────────┐
│ 🔍 Search transactions...           │
└─────────────────────────────────────┘
```
- Sticky at top when scrolling
- Live search (updates as you type)
- Searches: amount, category, notes
- Clear button (×) appears when typing
- Placeholder text in light gray

**Filter Chips**
```
[All] [Income] [Expense] [Date Range▼]
```
- Horizontal scrollable row
- Selected chip: Primary color background
- Unselected: Light gray outline
- Tap to toggle
- Date range opens date picker modal

**Date Separators**
```
Today - Jan 9, 2025
```
- Sticky headers while scrolling
- Bold text
- Background: Light gray
- Padding: 8px 16px

**Transaction Cards**
```
┌─────────────────────────────────────┐
│ 🍔│ Lunch                12:30 PM    │ ← Swipe for actions
│   │ Food                    -₱ 50.00│
│   │ "School cafeteria"              │ ← Note (if exists)
└─────────────────────────────────────┘
```

**Card Elements:**
- Category icon (left, 40px × 40px)
- Description (bold)
- Time (top right, gray)
- Category label (below description, small)
- Amount (right, large)
  - Red/orange for expenses (with -)
  - Green for income (with +)
- Optional note in quotes (lighter gray)
- Vertical divider line between icon and content

**Swipe Actions**
```
← Swipe Left                 Swipe Right →
┌─────────────────┐         ┌─────────────────┐
│    [✏️ Edit]    │         │   [🗑️ Delete]   │
└─────────────────┘         └─────────────────┘
```
- Swipe left 50%: Edit action appears (blue)
- Swipe right 50%: Delete action appears (red)
- Tap action to execute
- Release before 50%: Card returns to position

**Empty State**
```
┌─────────────────────────────────────┐
│                                     │
│         [Illustration]              │
│                                     │
│    No Transactions Yet              │
│                                     │
│  Start tracking your spending       │
│  by adding your first transaction   │
│                                     │
│      [➕ Add Transaction]           │
│                                     │
└─────────────────────────────────────┘
```

**Infinite Scroll:**
- Load 20 transactions initially
- Load more on scroll to bottom
- Loading indicator while fetching
- "No more transactions" message at end

**Interactions:**
- Tap transaction → View details modal
- Swipe left → Edit
- Swipe right → Delete (with confirmation)
- Pull down → Refresh list
- Search → Live filter results
- Filter chips → Filter by type/date

---

### 5. Budget Planning Screen

```
┌─────────────────────────────────────┐
│ ← Budget Overview           ⋮       │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Total Budget: ₱ 2,000           │ │
│ │ Spent: ₱ 650 (32%)              │ │ ← Summary Card
│ │ Remaining: ₱ 1,350              │ │
│ │ ███████░░░░░░░░░░░░░░░░░░ 32%   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Weekly] [Monthly]                  │ ← Period Toggle
│                                     │
│ Budget by Category                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🍔 Food                          │ │
│ │ ₱250 / ₱500               [Edit]│ │
│ │ ████████████░░░░░░░ 50%         │ │
│ │ Safe • ₱250 remaining           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🚌 Transportation                │ │
│ │ ₱80 / ₱200                [Edit]│ │
│ │ ████████░░░░░░░░░░ 40%          │ │
│ │ Safe • ₱120 remaining           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📚 School Supplies               │ │
│ │ ₱320 / ₱300               [Edit]│ │
│ │ ████████████████████████ 107%   │ │
│ │ ⚠️ Over budget by ₱20           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [➕ Add Category Budget]            │
│                                     │
└─────────────────────────────────────┘
```

**Component Details:**

**Total Budget Summary**
```
┌─────────────────────────────────────┐
│ Total Budget: ₱ 2,000               │
│ Spent: ₱ 650 (32%)                  │
│ Remaining: ₱ 1,350                  │
│ ███████░░░░░░░░░░░░░░░░░░ 32%       │
└─────────────────────────────────────┘
```
- Overview card at top
- Shows combined budget across all categories
- Color-coded progress bar
- Large, clear numbers

**Period Toggle**
```
┌──────────┬──────────┐
│  Weekly  │ Monthly  │
└──────────┴──────────┘
```
<function_calls>
<invoke name="artifacts">
<parameter name="command">update</parameter>
<parameter name="id">uiux_specifications</parameter>
<parameter name="old_str">**Period Toggle**
```
┌──────────┬──────────┐
│  Weekly  │ Monthly  │
└──────────┴──────────┘
```
-</parameter>
<parameter name="new_str">**Period Toggle**
```
┌──────────┬──────────┐
│  Weekly  │ Monthly  │
└──────────┴──────────┘
```
- Segmented control
- Selected period highlighted
- Switches all budget displays
- Smooth transition

**Budget Category Cards**
```
┌─────────────────────────────────────┐
│ 🍔 Food                       [Edit]│
│ ₱250 / ₱500                         │
│ ████████████░░░░░░░ 50%             │
│ Safe • ₱250 remaining               │
└─────────────────────────────────────┘
```

**Card States:**

**Safe (< 70%)**
- Progress bar: Green
- Status text: "Safe"
- Remaining amount in green

**Caution (70-90%)**
- Progress bar: Yellow
- Status text: "Watch spending"
- Remaining amount in yellow

**Warning (90-100%)**
- Progress bar: Orange
- Status text: "Approaching limit"
- Remaining amount in orange

**Over Budget (> 100%)**
- Progress bar: Red (fills past 100%)
- Status text: "⚠️ Over budget by ₱X"
- Overage amount in red

**Edit Budget (Inline)**
```
┌─────────────────────────────────────┐
│ 🍔 Food                              │
│ ┌─────────────────────────────────┐ │
│ │ Limit: ₱ [500]              ✓ ✗││ │
│ └─────────────────────────────────┘ │
│ ████████████░░░░░░░ 50%             │
│ Safe • ₱250 remaining               │
└─────────────────────────────────────┘
```
- Tap "Edit" button
- Limit becomes editable
- Number pad appears
- Checkmark to save, X to cancel
- Progress updates in real-time

**Add Budget Button**
```
┌─────────────────────────────────────┐
│      ➕ Add Category Budget         │
└─────────────────────────────────────┘
```
- Outlined button style
- Opens category selection + amount input
- Bottom of budget list

---

### 6. Reports & Analytics Screen

```
┌─────────────────────────────────────┐
│ ← Reports                    📤     │
├─────────────────────────────────────┤
│                                     │
│ [This Week] [This Month] [Custom▼] │ ← Period Selector
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │       [Pie Chart]               │ │
│ │   Expense Distribution          │ │ ← Charts
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │    [Bar Chart]                  │ │
│ │  Income vs Expenses             │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │    [Line Graph]                 │ │
│ │   Spending Trends               │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Summary                             │
│ ┌─────────────────────────────────┐ │
│ │ Total Income:      ₱ 3,000      │ │
│ │ Total Expenses:    ₱   650      │ │
│ │ Net Savings:       ₱ 2,350      │ │
│ │ Avg Daily Spend:   ₱    93      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Top Spending Categories             │
│ ┌─────────────────────────────────┐ │
│ │ 1. 🍔 Food          ₱250 (38%)  │ │
│ │ 2. 📚 School        ₱200 (31%)  │ │
│ │ 3. 🚌 Transport     ₱100 (15%)  │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Period Selector**
```
[This Week] [This Month] [Custom ▼]
```
- Chip-style buttons
- This Week: Last 7 days
- This Month: Current month
- Custom: Opens date range picker
- Active period highlighted

**Expense Distribution Pie Chart**
```
┌─────────────────────────────────────┐
│                                     │
│         🍔 Food 38%                 │
│       📚 School 31%                 │
│     🚌 Transport 15%                │
│       🎮 Play 11%                   │
│      ⚽ Sports 5%                   │
│                                     │
│    [Colorful Pie Chart]             │
│                                     │
└─────────────────────────────────────┘
```
- Interactive segments
- Tap to highlight category
- Shows percentage and amount
- Each category has distinct color
- Legend below or beside chart
- Smooth animation on load

**Income vs Expenses Bar Chart**
```
┌─────────────────────────────────────┐
│  3000│                               │
│  2500│     ┃                         │
│  2000│     ┃                         │
│  1500│     ┃                         │
│  1000│     ┃         ┃               │
│   500│     ┃         ┃               │
│     0└─────┸─────────┸───────        │
│         Income    Expenses           │
│       (Green)      (Red)             │
└─────────────────────────────────────┘
```
- Side-by-side bars
- Green bar for income
- Red bar for expenses
- Y-axis shows amounts
- Clear labels
- Grid lines for readability

**Spending Trends Line Graph**
```
┌─────────────────────────────────────┐
│  500│                          •     │
│  400│                    •           │
│  300│          •   •                 │
│  200│    •                           │
│  100│ •                              │
│     0└────────────────────────────   │
│      Mon Tue Wed Thu Fri Sat Sun    │
└─────────────────────────────────────┘
```
- Line connects daily spending totals
- Smooth curve
- Data points marked
- X-axis: Days
- Y-axis: Amount spent
- Tap point to see exact amount

**Summary Statistics Card**
```
┌─────────────────────────────────────┐
│ Total Income:        ₱ 3,000        │
│ Total Expenses:      ₱   650        │
│ Net Savings:         ₱ 2,350        │
│ Average Daily:       ₱    93        │
│ Highest Day:         ₱   250 (Mon)  │
└─────────────────────────────────────┘
```
- Clean table layout
- Labels left-aligned
- Amounts right-aligned
- Net savings highlighted (green/red)
- Tabular numbers for alignment

**Top Categories List**
```
┌─────────────────────────────────────┐
│ 1. 🍔 Food            ₱250    38%   │
│ 2. 📚 School          ₱200    31%   │
│ 3. 🚌 Transportation  ₱100    15%   │
│ 4. 🎮 Entertainment   ₱ 70    11%   │
│ 5. ⚽ Sports          ₱ 30     5%   │
└─────────────────────────────────────┘
```
- Ranked by spending
- Icon + category name
- Amount spent
- Percentage of total
- Top 5 only

**Export Button (Header)**
```
📤 Export
```
- Icon button in header
- Opens export options modal
- Options: CSV, PDF (future)
- Downloads file to device

---

### 7. Savings Goals Screen

```
┌─────────────────────────────────────┐
│ ← Savings Goals              ➕     │
├─────────────────────────────────────┤
│                                     │
│ Active Goals                        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📱 New Phone                    │ │
│ │ ₱2,500 / ₱5,000                 │ │
│ │ ██████████░░░░░░░░░ 50%         │ │
│ │ Target: March 1, 2025           │ │
│ │ [Add ₱]              [...]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎮 Gaming Console               │ │
│ │ ₱800 / ₱3,000                   │ │
│ │ █████░░░░░░░░░░░░░░ 27%         │ │
│ │ Target: June 15, 2025           │ │
│ │ ⚠️ Behind schedule              │ │
│ │ [Add ₱]              [...]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Completed Goals ▼                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✅ Basketball Shoes             │ │
│ │ Completed on Jan 5, 2025        │ │
│ │ ₱1,500 saved in 2 months        │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Goal Card (Active)**
```
┌─────────────────────────────────────┐
│ 📱 New Phone                        │ ← Icon + Name
│ ₱2,500 / ₱5,000                     │ ← Current / Target
│ ██████████░░░░░░░░░ 50%             │ ← Progress Bar
│ Target: March 1, 2025               │ ← Target Date
│ [Add Savings]           [⋮]         │ ← Actions
└─────────────────────────────────────┘
```

**Card Elements:**
- Large icon (user-selected or emoji)
- Goal name (bold, 18px)
- Current amount / Target amount
- Animated progress bar with percentage
- Target date
- Status indicator (on track/behind/ahead)
- "Add Savings" button (primary)
- Menu button (⋮) for edit/delete

**Progress Bar Colors:**
- **Green:** On track or ahead
- **Yellow:** Behind schedule but achievable
- **Red:** Significantly behind schedule
- **Blue:** Completed (100%+)

**Status Indicators:**
```
✅ On track
⚠️ Behind schedule
🎯 Almost there! (90%+)
🎉 Goal achieved!
```

**Add Savings Modal**
```
┌─────────────────────────────────────┐
│ Add to "New Phone"              ✕   │
├─────────────────────────────────────┤
│                                     │
│         ₱ 0.00                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │   7    8    9                   │ │
│ │   4    5    6                   │ │
│ │   1    2    3                   │ │
│ │   .    0    ⌫                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ New Total: ₱2,500 → ₱2,650          │
│ Progress: 50% → 53%                 │
│                                     │
│         [Add Savings]               │
│                                     │
└─────────────────────────────────────┘
```
- Amount input with number pad
- Shows current progress
- Preview of new total and percentage
- Confirm button

**Goal Completion Celebration**
```
┌─────────────────────────────────────┐
│                                     │
│         🎉 🎊 ✨                    │
│                                     │
│    Congratulations!                 │
│                                     │
│  You've reached your goal:          │
│     "New Phone"                     │
│                                     │
│  ₱5,000 saved in 3 months!          │
│                                     │
│    [View Goal] [Set New Goal]       │
│                                     │
└─────────────────────────────────────┘
```
- Full-screen modal
- Confetti animation
- Celebratory emojis
- Congratulatory message
- Goal name highlighted
- Time taken to achieve
- CTA buttons

**Completed Goals Section**
```
Completed Goals ▼

┌─────────────────────────────────────┐
│ ✅ Basketball Shoes                 │
│ Completed on Jan 5, 2025            │
│ ₱1,500 saved in 2 months            │
│ [View Details]                      │
└─────────────────────────────────────┘
```
- Collapsed by default
- Tap to expand
- Shows completion date
- Time taken displayed
- Muted colors (gray)
- Can view details or delete

**Create Goal Screen**
```
┌─────────────────────────────────────┐
│ ← Create Savings Goal           ✓   │
├─────────────────────────────────────┤
│                                     │
│ Goal Name                           │
│ ┌─────────────────────────────────┐ │
│ │ New Phone                       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Choose Icon                         │
│ 📱 🎮 🎧 👟 🎒 📚 🏀 ⚽ 🎸        │
│                                     │
│ Target Amount                       │
│ ┌─────────────────────────────────┐ │
│ │ ₱ 5000                          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Target Date                         │
│ ┌─────────────────────────────────┐ │
│ │ 📅 March 1, 2025           ▼   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Initial Savings (Optional)          │
│ ┌─────────────────────────────────┐ │
│ │ ₱ 0                             │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [Create Goal]                │
│                                     │
└─────────────────────────────────────┘
```

---

## UI Components Library (Ionic)

### Cards
```html
<ion-card>
  <ion-card-header>
    <ion-card-title>Card Title</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    Card content here
  </ion-card-content>
</ion-card>
```

**Styling:**
- Border radius: 12px
- Shadow: `0 2px 8px rgba(0,0,0,0.1)`
- Padding: 16px
- Margin: 16px (between cards)
- Background: White

### Buttons

**Primary Button**
```html
<ion-button expand="block" color="primary">
  Primary Action
</ion-button>
```
- Full width
- Height: 48px
- Border radius: 8px
- Font size: 16px, bold

**Secondary Button**
```html
<ion-button expand="block" fill="outline" color="primary">
  Secondary Action
</ion-button>
```
- Outlined style
- Same size as primary

**Icon Button**
```html
<ion-button fill="clear" size="small">
  <ion-icon name="create"></ion-icon>
</ion-button>
```
- No background
- Icon only
- Tap target: 44px minimum

**Floating Action Button (FAB)**
```html
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button color="primary">
    <ion-icon name="add"></ion-icon>
  </ion-fab-button>
</ion-fab>
```
- Size: 56px × 56px
- Elevation: 8dp
- Bottom right position

### Forms

**Input Field**
```html
<ion-item>
  <ion-label position="floating">Label</ion-label>
  <ion-input type="text" placeholder="Enter value"></ion-input>
</ion-item>
```
- Floating label
- Clear button
- Error state (red underline)

**Select Dropdown**
```html
<ion-item>
  <ion-label>Category</ion-label>
  <ion-select>
    <ion-select-option value="food">Food</ion-select-option>
    <ion-select-option value="transport">Transport</ion-select-option>
  </ion-select>
</ion-item>
```

**Date Picker**
```html
<ion-item>
  <ion-label>Date</ion-label>
  <ion-datetime presentation="date"></ion-datetime>
</ion-item>
```

### Lists

**Basic List**
```html
<ion-list>
  <ion-item>
    <ion-label>Item 1</ion-label>
  </ion-item>
  <ion-item>
    <ion-label>Item 2</ion-label>
  </ion-item>
</ion-list>
```

**List with Avatar/Icon**
```html
<ion-item>
  <ion-avatar slot="start">
    <ion-icon name="restaurant"></ion-icon>
  </ion-avatar>
  <ion-label>
    <h2>Primary Text</h2>
    <p>Secondary Text</p>
  </ion-label>
  <ion-note slot="end">-₱50.00</ion-note>
</ion-item>
```

**Sliding Item (Swipe Actions)**
```html
<ion-item-sliding>
  <ion-item>
    <ion-label>Swipe me</ion-label>
  </ion-item>
  <ion-item-options side="start">
    <ion-item-option color="primary">Edit</ion-item-option>
  </ion-item-options>
  <ion-item-options side="end">
    <ion-item-option color="danger">Delete</ion-item-option>
  </ion-item-options>
</ion-item-sliding>
```

### Feedback Components

**Toast Notification**
```typescript
const toast = await this.toastController.create({
  message: 'Expense saved successfully!',
  duration: 3000,
  position: 'bottom',
  color: 'success'
});
await toast.present();
```
- Duration: 3 seconds
- Position: Bottom (above tab bar)
- Colors: success (green), warning (orange), danger (red)

**Loading Spinner**
```typescript
const loading = await this.loadingController.create({
  message: 'Saving...',
  spinner: 'crescent'
});
await loading.present();
```

**Alert Dialog**
```typescript
const alert = await this.alertController.create({
  header: 'Delete Transaction',
  message: 'Are you sure you want to delete this?',
  buttons: [
    { text: 'Cancel', role: 'cancel' },
    { text: 'Delete', role: 'destructive' }
  ]
});
await alert.present();
```

### Progress Components

**Progress Bar**
```html
<ion-progress-bar value="0.5" color="success"></ion-progress-bar>
```
- Height: 8px
- Border radius: 4px
- Smooth animation: 500ms

**Skeleton Screens**
```html
<ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
<ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
```

---

## Accessibility Considerations

### Touch Targets
- **Minimum size:** 44px × 44px
- **Comfortable spacing:** 8px between targets
- **Large primary actions:** 48px height minimum

### Color Contrast
- **Text on white:** Ratio ≥ 4.5:1 (WCAG AA)
- **Large text:** Ratio ≥ 3:1
- **Don't rely on color alone:** Use icons, labels, patterns

### Screen Reader Support
```html
<ion-button aria-label="Add new expense">
  <ion-icon name="add"></ion-icon>
</ion-button>
```
- Descriptive aria-labels
- Semantic HTML elements
- Logical focus order

### Text Scaling
- Support system text size settings
- Use relative units (rem, em)
- Test with 200% text scale

---

## Animation & Transitions

### Page Transitions
```css
.ion-page {
  transition: transform 300ms ease-in-out;
}
```
- Duration: 300ms
- Easing: ease-in-out
- Direction: Slide left/right

### Micro-animations

**Button Press**
```css
ion-button:active {
  transform: scale(0.98);
  transition: transform 100ms;
}
```

**Card Tap**
```css
ion-card:active {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transition: all 200ms;
}
```

**Progress Bar Fill**
```css
ion-progress-bar {
  transition: value 500ms ease-out;
}
```

**Chart Rendering**
- Staggered animation
- Duration: 800ms total
- Delay between elements: 100ms

### Loading States

**Button Loading**
```html
<ion-button [disabled]="isLoading">
  <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
  <span *ngIf="!isLoading">Save</span>
</ion-button>
```

**Content Loading**
```html
<ion-content>
  <div *ngIf="isLoading">
    <ion-skeleton-text animated></ion-skeleton-text>
  </div>
  <div *ngIf="!isLoading">
    <!-- Actual content -->
  </div>
</ion-content>
```

---

## Responsive Design

### Breakpoints
```css
/* Mobile (default) */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

### Grid System
```html
<ion-grid>
  <ion-row>
    <ion-col size="12" size-md="6">
      <!-- Content -->
    </ion-col>
  </ion-row>
</ion-grid>
```

### Adaptive Layouts
- **Mobile:** Single column, full width
- **Tablet:** Two columns for budget cards, charts
- **Desktop:** Three columns max, centered content

---

## Error States & Empty States

### Empty State Pattern
```
┌─────────────────────────────────────┐
│                                     │
│         [Illustration]              │
│          (150×150px)                │
│                                     │
│     No [Items] Yet                  │
│     (20px, bold)                    │
│                                     │
│  Short encouraging message          │
│  explaining what to do next         │
│  (16px, regular, gray)              │
│                                     │
│      [Primary CTA Button]           │
│                                     │
└─────────────────────────────────────┘
```

**Empty State Examples:**

1. **No Transactions**
   - Icon: 📝 or illustration
   - Title: "No transactions yet"
   - Message: "Start tracking by adding your first expense or income"
   - CTA: "Add Transaction"

2. **No Budgets**
   - Icon: 💰 or illustration
   - Title: "No budgets set"
   - Message: "Create your first budget to start managing your spending"
   - CTA: "Create Budget"

3. **No Goals**
   - Icon: 🎯 or illustration
   - Title: "No savings goals"
   - Message: "Set a goal and start saving for something special"
   - CTA: "Create Goal"

### Error State Pattern
```
┌─────────────────────────────────────┐
│                                     │
│         ⚠️                          │
│     (48px, red/orange)              │
│                                     │
│     Oops! Something went wrong      │
│     (18px, bold)                    │
│                                     │
│  [Specific error message explaining │
│   what happened and what to do]     │
│  (16px, regular)                    │
│                                     │
│      [Retry Button]                 │
│      [Go Back]                      │
│                                     │
└─────────────────────────────────────┘
```

### Form Validation Errors
```
┌─────────────────────────────────────┐
│ Amount                              │
│ ┌─────────────────────────────────┐ │
│ │ [Invalid input]                 │ │ ← Red border
│ └─────────────────────────────────┘ │
│ ⚠️ Amount must be greater than 0   │ ← Error message
└─────────────────────────────────────┘
```

**Validation Rules:**
- Show error on blur or submit
- Clear error on valid input
- Specific, helpful messages
- Red color for error state
- Icon (⚠️) for emphasis

---

## Success Patterns

### Success Messages
```
✅ Transaction saved successfully
✅ Budget updated
✅ Goal created
🎉 Goal achieved!
💾 Data exported
```

### Success States
- Green checkmark icon
- Brief confirmation message
- Auto-dismiss after 3s
- Positive reinforcement tone

---

## Best Practices

### Do's ✅
- Use consistent spacing (multiples of 4px)
- Provide immediate visual feedback
- Use color to communicate state
- Keep important actions easily accessible
- Use familiar UI patterns
- Provide clear labels and instructions
- Celebrate user achievements
- Make error messages helpful
- Test with actual users

### Don'ts ❌
- Don't use too many colors
- Don't hide important functions
- Don't use jargon or complex terms
- Don't make users think too hard
- Don't overwhelm with information
- Don't skip loading states
- Don't ignore error scenarios
- Don't forget empty states
- Don't sacrifice usability for aesthetics

---

## References

### Design Inspiration
- **Ionic Design System:** https://ionicframework.com/docs/layout/structure
- **Material Design:** https://m3.material.io/
- **iOS Human Interface Guidelines:** https://developer.apple.com/design/

### Accessibility
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Mobile Accessibility:** https://www.w3.org/WAI/standards-guidelines/mobile/

### Best Practices
- **Nielsen Norman Group:** https://www.nngroup.com/topic/mobile-tablet/
- **Google Material Design:** https://material.io/design

---

## Implementation Notes

When implementing these designs:

1. **Start with the design system** (colors, typography, spacing)
2. **Build reusable components** (cards, buttons, forms)
3. **Create screen layouts** using the components
4. **Add interactions and animations** progressively
5. **Test on real devices** with actual users
6. **Iterate based on feedback**

Remember: This is a tool for junior high school students. Keep it simple, friendly, and encouraging!</parameter>