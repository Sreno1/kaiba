# **Kaiba - Technical Project Overview**

## **Project Summary**

Kaiba is a Laravel-React productivity application that combines todo management with a sophisticated scheduling system. The application features a dual-sidebar interface where users can manage todos in the main content area, access quick notes via a right sidebar, and utilize a comprehensive scheduling system with daily reset functionality via a left sidebar.

## **Core Architecture**

### **Framework Stack**
- **Backend**: Laravel 12 (PHP 8.2+) with Inertia.js
- **Frontend**: React 18 with Vite build system
- **Styling**: Tailwind CSS with Kibo UI components (based on shadcn/ui)
- **Authentication**: Laravel Sanctum for API authentication
- **Database**: SQL-based with Eloquent ORM
- **Local Storage**: Browser localStorage for schedule and notes persistence

## **Core Components**

### **Backend Components**

#### **Models (`app/Models/`)**

**`User.php`**: Authenticatable model with HasFactory and Notifiable traits
- Relationships: `hasMany(Todo::class)`
- Mass assignable: name, email, password
- Hidden attributes: password, remember_token
- Authentication features via Laravel's built-in traits

**`Todo.php`**: Core business entity for task management
- Relationships: `belongsTo(User::class)`, `belongsToMany(Tag::class)`
- Mass assignable: title, description, completed, priority, due_date, user_id
- Casts: completed (boolean), due_date (date)
- Priority levels: low, medium, high
- User-scoped access control

**`Tag.php`**: Categorization entity for organizing todos
- Relationships: `belongsToMany(Todo::class)`
- Mass assignable: name, color, description
- Global scope (shared across users)
- Color hex code support for visual organization

#### **API Controllers (`app/Http/Controllers/Api/`)**

**`TodoController.php`**: RESTful API resource controller
- Uses Laravel Policy for authorization (`TodoPolicy`)
- Methods: index(), store(), show(), update(), destroy()
- Comprehensive validation rules for CRUD operations
- Eager loading of tag relationships for performance
- User-scoped data access

**`TagController.php`**: Tag management API
- Global tags (not user-scoped)
- Standard CRUD operations with validation
- Color hex code validation
- Unique name constraints

#### **Authorization (`app/Policies/`)**

**`TodoPolicy.php`**: Row-level security implementation
- Ensures users can only access their own todos
- Methods: view(), create(), update(), delete()
- Authorization checks based on user_id ownership

### **Frontend Components**

#### **Layout System**

**`AuthenticatedLayout.jsx`**: Base authenticated layout
- Navigation bar with dropdown user menu
- Responsive navigation for mobile devices
- Route-aware navigation highlighting
- User profile access and logout functionality

#### **Todo Management (`Pages/Todos.jsx`)**
- **State Management**: Multiple useState hooks for forms, dialogs, sidebars
- **API Integration**: Axios HTTP client for Laravel API communication
- **Features**: 
  - CRUD operations for todos
  - Tagging system with color coding
  - Priority management (low, medium, high)
  - Due date functionality
  - Completion tracking
- **UI Patterns**: 
  - Modal dialogs for create/edit operations
  - Card-based display for todos
  - Dual sidebar layout (schedule left, notes right)
  - Floating action buttons for sidebar toggles

#### **Schedule System (`Components/Schedule/`)**

**`ScheduleTable.jsx`**: Daily scheduling component
- **4-column structure**: Item, Time, Points, Done checkbox
- **Real-time auto-save**: Changes persist to localStorage immediately
- **Midnight reset mechanism**: Uses recursive setTimeout for daily resets
- **Template system**: Save current schedule as template for future days
- **Progress tracking**: Visual progress bars and point calculations
- **Data archival**: Automatic historical data management (90-day retention)

**`ScheduleHistory.jsx`**: Historical data viewer
- **Three view modes**: Daily, Weekly, Monthly
- **Statistical calculations**: Completion rates, point averages, trends
- **Date navigation**: Forward/backward navigation through time periods
- **Progress visualization**: Charts and progress indicators
- **Data aggregation**: Summarizes performance across time periods

**`Schedule.jsx`**: Container component with tab navigation
- **Tab system**: Today vs History view switching
- **Component composition**: Orchestrates ScheduleTable and ScheduleHistory
- **State management**: Handles active tab state

#### **UI Component Library**

**Kibo UI Components** (based on shadcn/ui):
- **Architecture**: Components copied directly into codebase (`@/components/ui/`) 
- **Foundation**: Built on Radix UI primitives with Tailwind CSS styling
- **Customization**: Full access to component source code for modifications
- **Design System**: Shares shadcn's design tokens (colors, fonts, spacing)
- **Components Used**: Button, Card, Dialog, Input, Checkbox, Select, Badge, Textarea

**Component Structure**:
```
Kibo UI Components (Styled) → Radix UI Primitives (Behavior) → Native HTML Elements
```

**Key Features**:
- **On-demand Installation**: Components added only when needed
- **Direct Code Access**: Component source lives in project for customization
- **Primitive Extensions**: All components support native HTML attributes
- **Theme Integration**: Automatic integration with shadcn's design system

## **Component Interactions**

### **Data Flow Architecture**
```
Frontend (React) ↔ Inertia.js ↔ Laravel Routes ↔ Controllers ↔ Models ↔ Database
                     ↓
                Browser localStorage (Schedule data + Quick Notes)
```

### **API Communication**
- **Authentication**: Laravel Sanctum tokens via axios interceptors
- **REST Endpoints**: 
  - `/api/todos` - Todo CRUD operations with tag relationships
  - `/api/tags` - Tag management (global scope)
- **Request Flow**: React → Axios → Laravel API Routes → Controllers → Models
- **Response Flow**: JSON responses with eager-loaded relationships
- **Error Handling**: Validation errors propagated to frontend with user alerts

### **State Management Patterns**
- **Local State**: React useState for component-level state management
- **Persistent Storage**: localStorage for schedule data and quick notes
- **Server State**: API calls with manual cache invalidation (refetch after mutations)
- **Cross-component Communication**: State lifting and prop passing

### **Real-time Features**
- **Auto-save**: useEffect hooks with setTimeout for delayed saves (2-second debounce)
- **Midnight Reset**: Recursive setTimeout for daily schedule resets at 11:59 PM
- **Data Archival**: Automatic historical data management with cleanup
- **Template System**: Save/load schedule templates for recurring patterns

## **Deployment Architecture**

### **Build System**
- **Frontend Bundler**: Vite with React plugin for fast development and optimized builds
- **Asset Pipeline**: Laravel Vite plugin integration for seamless asset management
- **Build Output**: Static assets to `public/build/` directory
- **Build Command**: `npm run build` for production builds
- **Development**: `npm run dev` for hot module replacement

### **Development Environment**
- **Concurrent Services**: Custom composer script runs 4 services simultaneously:
  - PHP Artisan server (Laravel backend)
  - Queue listener (background jobs)
  - Laravel Pail (real-time logs)
  - Vite dev server (frontend with HMR)
- **Local Development**: Laravel Valet integration for local domain management
- **Command**: `composer run dev` starts all services

### **Dependencies**

#### **Backend Dependencies (composer.json)**
- **Core**: Laravel Framework 12, Inertia.js Laravel adapter
- **Authentication**: Laravel Sanctum, Laravel Breeze
- **Utilities**: Ziggy (route helpers), Tinker (REPL)
- **Development**: PHPUnit, Laravel Pail, Laravel Pint

#### **Frontend Dependencies (package.json)**
- **Core**: React 18, React DOM
- **Build**: Vite, Laravel Vite plugin, Tailwind CSS
- **UI**: Kibo UI components, Lucide React icons
- **Utilities**: Axios, React Markdown, Class Variance Authority
- **Development**: Concurrently for multi-service development

### **Database Architecture**
- **Primary Tables**: users, todos, tags
- **Pivot Table**: todo_tag (many-to-many relationship)
- **System Tables**: cache, jobs, sessions, personal_access_tokens
- **Migration System**: Laravel schema builder with foreign key constraints
- **Seeding**: TagSeeder for initial tag data

## **Runtime Behavior**

### **Application Initialization**
1. **Laravel Bootstrap**: Routes, middleware, service providers loaded
2. **Inertia.js Setup**: React app mounted with server-side props
3. **React Hydration**: Component tree rendered with initial data
4. **Schedule System**: Midnight reset timers established on component mount
5. **Authentication**: Sanctum token validation and user session management

### **Request/Response Cycle**

#### **Web Routes (Inertia.js)**
- Server renders Inertia response with props (no full page reloads)
- React components receive data via props
- Navigation handled client-side with server-side data fetching

#### **API Routes**
- Sanctum authentication middleware for all protected endpoints
- Request validation in controllers with detailed error responses
- Eloquent ORM database operations with relationship loading
- JSON response formatting with proper HTTP status codes

### **Business Workflows**

#### **Todo Management Workflow**
1. User creates/edits todos via modal forms with validation
2. Frontend validates input and sends API request via Axios
3. Controller validates request and authorizes action via TodoPolicy
4. Model persists data with tag relationships using pivot table
5. Frontend refetches updated data and updates UI state

#### **Schedule Management Workflow**
1. All operations performed client-side using localStorage
2. Auto-save triggers on every change with 2-second debounce
3. Midnight timer archives current day and resets for new day
4. Historical data aggregated for weekly/monthly views
5. Template system allows saving/loading recurring schedules

#### **Authentication Workflow**
1. Laravel Breeze handles registration/login with session management
2. Sanctum tokens generated for API authentication
3. Frontend axios interceptors attach tokens to requests
4. Policy classes enforce user-scoped data access

### **Error Handling**
- **Backend**: Laravel exception handling with structured JSON error responses
- **Frontend**: Try-catch blocks with user-facing alert() messages
- **Validation**: Server-side validation with error message propagation
- **Network**: Axios error interceptors for handling API failures

### **Background Tasks**
- **Auto-save**: Client-side debounced saves (2-second delay)
- **Midnight Reset**: Browser-based timer system for schedule resets
- **Data Cleanup**: Automatic removal of schedule data older than 90 days
- **Queue System**: Laravel queues available for background processing

### **Security Model**
- **Authentication**: Session-based with Sanctum token support
- **Authorization**: Policy-based row-level security for todos
- **CSRF Protection**: Laravel middleware for state-changing operations
- **Data Isolation**: User-scoped todo access, global tag system
- **Input Validation**: Server-side validation for all user inputs

## **Key Features Summary**

### **Todo Management**
- Complete CRUD operations with form validation
- Priority levels and due date functionality
- Tag-based organization with color coding
- User-scoped data access with authorization policies

### **Schedule System**
- Daily scheduling with 4-column table (Item, Time, Points, Done)
- Automatic midnight reset with data archival
- Template system for recurring schedules
- Comprehensive history views (Daily, Weekly, Monthly)
- Progress tracking with point systems and completion rates
- 90-day data retention with automatic cleanup

### **User Interface**
- Dual sidebar layout (Schedule left, Notes right)
- Responsive design with mobile navigation
- Modal-based forms for data entry
- Real-time updates with auto-save functionality
- Floating action buttons for sidebar controls

### **Technical Highlights**
- Hybrid data storage (Database for todos, localStorage for schedule)
- Modern React patterns with hooks and functional components
- Laravel best practices with policies, validation, and relationships
- Efficient build system with Vite and hot module replacement
- Component-based architecture with reusable UI elements

## **Development Notes**

### **Architecture Decisions**
- **Schedule localStorage**: Chosen for offline capability and performance
- **Inertia.js**: Enables SPA-like experience with server-side routing
- **Dual Storage**: Database for persistent todos, localStorage for transient schedule data
- **Component Library**: Kibo UI provides customizable components with design consistency

### **Performance Considerations**
- Eager loading of relationships to prevent N+1 queries
- Debounced auto-save to prevent excessive API calls
- Efficient localStorage management with automatic cleanup
- Vite's fast bundling and hot module replacement for development

### **Extensibility**
- Policy-based authorization allows easy permission modifications
- Component-based architecture supports feature additions
- Separate schedule system can be extended independently
- API structure supports additional endpoints and functionality
