# Simple Budget Tracker - Merit

A mobile application designed to help junior high school students develop financial literacy by tracking income, expenses, budgets, and savings goals. Built with **Ionic Angular** and **Capacitor** for Android.

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-0.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📱 Overview

**Simple Budget Tracker** (Merit) is an educational mobile application that empowers junior high school students (Grades 7-10) to take control of their finances. Through an intuitive and engaging interface, students learn essential financial literacy skills by practically managing their money.

### Problem Statement
Many junior high school students lack proper budgeting habits and financial awareness, leading to poor spending decisions. This app bridges the gap between financial education theory and real-world application through interactive digital tools.

### Key Objectives
- ✅ Enable students to record and monitor daily/weekly/monthly income and expenses
- ✅ Promote financial awareness and responsible spending behavior
- ✅ Support early financial literacy development through practical application
- ✅ Provide simple visual insights into spending patterns

---

## ⭐ Features

### 1. 💰 Income Management
- Record allowances and small earnings
- Categorize income sources
- View income history and totals
- Quick add with predefined amounts

### 2. 📊 Expense Tracking
- Manual entry of daily expenses
- Predefined categories: Food, Transportation, School Supplies, Leisure, Others
- Custom category creation with icon selection
- Date and amount recording
- Optional notes/descriptions per transaction
- Recent transactions list
- Search and filter functionality

### 3. 📈 Budget Planning
- Set budget limits per category
- Weekly and monthly budget goals
- Budget vs. actual spending comparison
- Overspending alerts/warnings with color coding
- Budget recommendations based on past spending

### 4. 📉 Visual Reports & Analytics
- Pie charts showing expense distribution by category
- Bar graphs comparing income vs. expenses
- Weekly and monthly spending summaries
- Simple trend visualization
- Spending patterns timeline
- Category-wise spending breakdown

### 5. 🎯 Savings Tracker
- Track multiple savings goals
- Monitor progress toward goals with progress bars
- Calculate savings rate
- Visual goal achievement indicators
- Motivational messages upon milestone completion

### 6. 🏠 Dashboard
- Quick overview of current balance
- Today's spending summary
- Budget status indicators
- Upcoming budget warnings
- Recent transactions preview
- Savings goals progress

### 7. 💾 Data Management
- Export data to CSV
- Basic data backup functionality
- Clear all data option with confirmation
- Transaction editing and deletion

---

## 🛠️ Technology Stack

### Frontend
- **Ionic Framework** 8.0+ - Mobile UI framework
- **Angular** 20.0+ - Frontend framework
- **TypeScript** - Programming language
- **RxJS** - Reactive programming library
- **Capacitor** 8.0+ - Native bridge for Android/iOS

### Backend & Storage
- **SQLite** (@capacitor-community/sqlite 7.0.3) - Local database
- **Capacitor Filesystem** - File storage

### Data Visualization
- **Chart.js** 4.5.1 - Advanced charting library

### Utilities
- **date-fns** 4.1.0 - Date manipulation
- **uuid** 9.0.1 - Unique identifier generation
- **ionicons** 7.0.0 - Icons library

### Development Tools
- **Angular CLI** - Build and development tool
- **Karma** - Testing framework
- **ESLint** - Code linting
- **TypeScript** - Type checking

---

## 🎯 Target Users

- **Primary:** Junior high school students (Grades 7-10, ages 12-16)
- **Secondary:** Teachers using this for financial literacy education
- **Tertiary:** Parents wanting to help children learn budgeting

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher) and npm
- **Ionic CLI** - Install with `npm install -g ionic`
- **Android SDK** (for Android builds)
- **Git** - Version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LaryllParaiso/merit.git
   cd merit/budget-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Ionic and Capacitor**
   ```bash
   npm install -g ionic
   ionic cap add android
   ```

4. **Sync Capacitor plugins**
   ```bash
   npm run cap:sync:android
   ```

### Running Locally

#### Development Server
```bash
npm start
# or
ionic serve
```
The app will open in your browser at `http://localhost:4200`

#### Android Build
```bash
ionic build
ionic cap sync android
ionic cap open android
```
Open in Android Studio and run on emulator or device.

### Building for Production

```bash
ionic build --prod
ionic cap sync android
# Open android folder in Android Studio for release build
```

---

## 📁 Project Structure

```
SimpleBudgetTracker/
├── budget-tracker/                 # Main Ionic project
│   ├── src/
│   │   ├── app/                   # Angular application
│   │   │   ├── components/        # Reusable components
│   │   │   ├── pages/             # Page components
│   │   │   ├── services/          # Business logic services
│   │   │   ├── models/            # Data models & interfaces
│   │   │   ├── app.component.ts   # Root component
│   │   │   └── app-routing.module.ts
│   │   ├── assets/                # Static images, icons
│   │   ├── environments/          # Environment configurations
│   │   ├── theme/                 # SCSS theme & styles
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── global.scss
│   ├── android/                   # Capacitor Android files
│   ├── www/                       # Built web assets
│   ├── package.json               # Project dependencies
│   ├── angular.json               # Angular CLI config
│   ├── capacitor.config.ts        # Capacitor configuration
│   ├── ionic.config.json          # Ionic configuration
│   ├── tsconfig.json              # TypeScript configuration
│   └── karma.conf.js              # Testing configuration
├── design_screenshots/             # UI/UX design references
├── Simple Budget Tracker - AI Development Prompt & QA Checklist.md
├── Simple Budget Tracker System for Junior High School Students.md
├── UI_UX Design Specifications - Budget Tracker.md
└── README.md                       # This file
```

---

## 🎨 Design & UI/UX

### Color Palette
- **Primary:** Blue (#4A90E2) - Trust and stability
- **Secondary:** Green (#52C41A) - Savings and positive balance
- **Accent:** Orange (#FA8C16) - Warnings and attention
- **Danger:** Red (#F5222D) - Overspending alerts
- **Background:** Light gray (#F5F5F5) with white cards

### Typography
- **Font:** Roboto or Inter (modern, highly readable)
- **Headings:** 24px bold
- **Subheadings:** 18px medium
- **Body:** 16px regular
- **Captions:** 14px regular

### Key Design Principles
- **Simplicity First** - Minimal cognitive load for students
- **Youth-Friendly** - Engaging colors and modern interface
- **Immediate Feedback** - Real-time validation and confirmations
- **Visual Learning** - Heavy use of icons and charts
- **Encouraging Tone** - Positive reinforcement

### Screens Overview
1. **Onboarding Flow** - Welcome, features, profile setup, initial budget
2. **Dashboard** - Balance overview, today's spending, budget status
3. **Add Transaction** - Number pad, category selector, date picker
4. **Transactions List** - Chronological list with search and filter
5. **Budget View** - Category budgets with progress indicators
6. **Reports & Analytics** - Pie charts, bar graphs, spending trends
7. **Savings Goals** - Goal tracking with progress visualization
8. **Settings** - Data backup, export, user preferences

For detailed design specifications, see [UI_UX Design Specifications - Budget Tracker.md](./UI_UX%20Design%20Specifications%20-%20Budget%20Tracker.md)

---

## 💾 Database Schema

### Core Tables
- **users** - User profile information
- **categories** - Income/expense categories
- **transactions** - Individual income and expense records
- **budgets** - Category-based budget limits
- **savings_goals** - Savings target tracking

For detailed schema, see the initialization code in `src/app/services/database.service.ts`

---

## 📚 Key Services

### DatabaseService
Handles all SQLite database operations, CRUD operations for entities, and data persistence.

### TransactionService
Manages income and expense transactions, filtering, searching, and analytics calculations.

### BudgetService
Handles budget creation, updates, and comparisons with actual spending.

### SavingsGoalService
Manages savings goals, progress tracking, and milestone celebrations.

### NotificationService
Sends alerts for overspending and budget warnings.

---

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run tests with coverage:
```bash
ng test --code-coverage
```

---

## 🔒 Security Considerations

- ✅ All data stored locally on device (no cloud sync by default)
- ✅ SQLite database encrypted at rest
- ✅ Input validation on all transaction entries
- ✅ Secure number pad for amount entry
- ✅ Optional PIN lock feature (future enhancement)

---

## 📝 Development Notes

### Phase 1: Foundation & Setup
- [x] Project initialization
- [x] Capacitor configuration
- [x] SQLite setup
- [x] Data models

### Phase 2: Core Features (In Progress)
- [ ] Dashboard implementation
- [ ] Transaction management
- [ ] Budget planning
- [ ] Reports & analytics

### Phase 3: Advanced Features
- [ ] Data export/import
- [ ] Advanced visualizations
- [ ] Spending recommendations
- [ ] Social features (optional)

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow Angular style guide
- Use TypeScript strict mode
- Write meaningful commit messages
- Test your code before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Laryll Paraiso**
- GitHub: [@LaryllParaiso](https://github.com/LaryllParaiso)

---

## 📞 Support & Contact

For issues, questions, or suggestions, please:
1. Check existing [GitHub Issues](https://github.com/LaryllParaiso/merit/issues)
2. Create a new issue with detailed description
3. Include screenshots or error logs if applicable

---

## 🙏 Acknowledgments

- Ionic Framework team for excellent documentation
- Angular community for best practices
- Junior high school students for inspiration and feedback
- Educators advocating for financial literacy in schools

---

## 📚 Additional Resources

### Official Documentation
- [Ionic Documentation](https://ionicframework.com/docs)
- [Angular Documentation](https://angular.io/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor SQLite Plugin](https://github.com/capacitor-community/sqlite)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)

### Educational Resources
- [Financial Literacy for Teens](https://www.investopedia.com/financial-literacy-for-teens-7652074)
- [Teaching Kids About Money](https://www.moneyhelp.gov.uk/)

---

**Made with ❤️ for young financial enthusiasts**
