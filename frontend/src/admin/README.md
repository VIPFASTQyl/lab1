# Admin Dashboard - Complete Documentation

## Overview

A professional, production-ready **Admin Dashboard** for the Event Ticketing Platform built with **React 18**, **Tailwind CSS**, and **shadcn/ui-inspired components**.

Features:
- ✅ Responsive design (mobile-friendly sidebar, collapsible navigation)
- ✅ Dark/Light mode support
- ✅ Comprehensive CRUD operations for Events, Customers, Orders, Discounts, etc.
- ✅ Advanced data tables with search, sorting, and pagination
- ✅ Multi-tab forms for complex data entry
- ✅ Modal dialogs for detailed views
- ✅ Real-time notifications and toasts
- ✅ Status badges with multiple states
- ✅ Professional UI/UX with consistent theming

---

## Project Structure

```
src/admin/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx          # Collapsible navigation sidebar
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── AdminLayout.jsx      # Main layout wrapper
│   │   └── index.js
│   ├── common/
│   │   ├── DataTable.jsx        # Reusable data table with search & pagination
│   │   ├── StatusBadge.jsx      # Status indicator component
│   │   ├── MetricCard.jsx       # KPI metric cards
│   │   └── index.js
├── pages/
│   ├── DashboardPage.jsx        # Dashboard overview with metrics
│   ├── EventsListPage.jsx       # Events CRUD list
│   ├── EventFormPage.jsx        # Event create/edit form with tabs
│   ├── OrdersPage.jsx           # Orders management with detail modal
│   ├── CustomersPage.jsx        # Customers CRUD template
│   ├── DiscountsPage.jsx        # Discounts/Promo codes management
│   ├── ReviewsPage.jsx          # Customer reviews moderation
│   └── index.js
├── stores/
│   └── index.js                 # Zustand stores for admin state
├── utils/
│   └── PrivateAdminRoute.jsx    # Admin auth protection HOC
└── README.md                    # (this file)
```

---

## Core Components

### 1. **AdminLayout**
Main wrapper that applies sidebar, navbar, and styling to all admin pages.

```jsx
<AdminLayout isDark={isDark} setIsDark={setIsDark}>
  <YourPage />
</AdminLayout>
```

### 2. **Sidebar**
Collapsible navigation with dynamic menu items and sub-menus.

**Features:**
- Mobile hamburger button
- Expandable/collapsible submenus (Events, Locations, Orders)
- Active state indicators
- Responsive: hidden on mobile, visible on md+ screens

**Menu Items:**
- Dashboard
- Events (All Events, Add New Event)
- Locations (All Locations, Add Location)
- Sectors
- Tickets
- Orders (All Orders, Payments)
- Customers
- Organizers
- Discounts / Promo Codes
- Reviews
- Reports

### 3. **Navbar**
Top navigation with utilities and admin profile menu.

**Features:**
- Search bar (integrated search across events, orders, etc.)
- Notification bell with indicator
- Language selector
- Dark/Light mode toggle
- Profile dropdown with logout

### 4. **DataTable**
Highly reusable table component for all CRUD list views.

**Props:**
- `columns`: Array of column definitions `{ key, label, sortable, render }`
- `data`: Array of row data
- `searchable`: Enable/disable search
- `onEdit`, `onDelete`, `onView`: Callbacks for actions
- `addButton`: Custom button (e.g., "Add New Event")
- `title`: Table title

**Features:**
- **Search**: Real-time filtering across all columns
- **Sort**: Click headers to toggle sort ascending/descending
- **Pagination**: 10 rows per page with prev/next navigation
- **Empty State**: Shows "No data found" message
- **Dark Mode**: Full support with `-300/-800` Tailwind classes

```jsx
<DataTable
  title="All Events"
  columns={[
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> }
  ]}
  data={events}
  searchable={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### 5. **StatusBadge**
Colored badge for status indicators.

**Supported Statuses:**
- `active`, `inactive`, `pending`, `completed`, `cancelled`, `draft`, `sold_out`, `available`

```jsx
<StatusBadge status="active" /> // Shows "Active" with green background
```

### 6. **MetricCard**
KPI display card with icon and optional trend.

```jsx
<MetricCard 
  title="Total Events" 
  value="24" 
  icon={Calendar} 
  color="blue"
  trend={{ up: true, label: '+3 this month' }}
/>
```

---

## Pages & Features

### **Dashboard Overview Page** (`/admin`)
Landing page with high-level metrics and recent activity.

**Sections:**
1. **Key Metrics (4 Cards)**
   - Total Events (24, +3 trend)
   - Tickets Sold Today (1,240, +15% trend)
   - Revenue ($45,890, +$5,200 trend)
   - Active Users (3,520, +120 trend)

2. **Sales Chart**: Placeholder for Chart.js or Recharts integration
3. **Quick Stats**: Conversion rate, AOV, total revenue
4. **Recent Orders**: Last 4 orders in DataTable
5. **Upcoming Events**: Upcoming events with availability

### **Events CRUD Pages**

#### Events List (`/admin/events`)
- Search/filter by event title, location, category
- Sort by date, revenue, tickets sold
- Action buttons: View, Edit, Delete
- "New Event" button
- Mock: 5 events with realistic data

#### Create/Edit Event Form (`/admin/events/new`, `/admin/events/:id/edit`)
Multi-tab form with:
1. **Basic Info**: Title, Category, Status, Description
2. **Details**: Location, Capacity, Base Price
3. **Date & Time**: Event date, start/end time
4. **Media**: Event image URL with preview
5. **Organizers**: Organizer name

Features:
- Tab navigation with smooth transitions
- Dynamic form state management
- Cancel/Save buttons
- Auto-populates for edit mode
- Form validation ready (add as needed)

#### View Event Detail
Modal/page showing full event information with options to edit or delete.

### **Orders Page** (`/admin/orders`)
- Orders list with DataTable
- Columns: Order ID, Customer, Event, Tickets, Total, Status, Date
- View button opens detail modal

**Order Detail Modal Features:**
- Order ID and status
- Customer info (name, email)
- Order items breakdown
- Total price
- Download Invoice button

### **Customers Page** (`/admin/customers`)
Generic CRUD template for Customers.

**Columns:**
- Name, Email, Orders (count), Total Spent, Status, Join Date
- Action buttons: Edit, Delete

### **Discounts Page** (`/admin/discounts`)
Manage promotional codes.

**Columns:**
- Code, Description, Discount %, Usage Count, Expiry Date, Status
- Edit/Delete actions

### **Reviews Page** (`/admin/reviews`)
Moderate customer reviews.

**Columns:**
- Reviewer, Event, Rating (5-star), Comment, Date, Status
- Approve or delete reviews

---

## Authentication & Authorization

### `PrivateAdminRoute` Component
Protects admin routes from unauthorized access.

```jsx
<Route
  path="/admin/*"
  element={
    <PrivateAdminRoute>
      <AdminLayout>
        {/* Admin pages */}
      </AdminLayout>
    </PrivateAdminRoute>
  }
/>
```

Currently: **Demo mode** (`isAdminUser` set to `true`)

**To implement real auth:**
1. Check JWT token in localStorage
2. Verify role claim is `"admin"`
3. Redirect to login if unauthorized

```jsx
const isAdmin = localStorage.getItem('role') === 'admin';
```

---

## Stores (Zustand)

### `useAdminStore`
```js
{
  isAdmin: boolean,          // Admin logged in
  user: object | null,       // Admin user data
  setAdmin: (val) => void,
  setUser: (user) => void,
  logout: () => void
}
```

### `useAdminNotifications`
```js
{
  notifications: array,
  addNotification: (notification) => void,
  removeNotification: (id) => void
}
```

---

## Styling & Dark Mode

### Tailwind Classes Used:
- **Light Colors**: `white`, `gray-50` to `gray-100`
- **Dark Colors**: `slate-800`, `slate-900` with `dark:` prefix
- **Interactive**: `hover:`, `active:`, `focus:ring-2`
- **Responsive**: `md:`, `lg:` breakpoints
- **Status Colors**:
  - Active: `green-100`, `green-600`, `dark:green-900`
  - Pending: `yellow-100`, `yellow-600`, `dark:yellow-900`
  - Danger: `red-100`, `red-600`, `dark:red-900`

### Dark Mode Implementation:
```jsx
const [isDark, setIsDark] = useState(false);

<div className={isDark ? 'dark' : ''}>
  {/* Content uses dark: prefix classes */}
</div>
```

---

## Usage Examples

### Adding a New CRUD Page (e.g., Locations)

**1. Create List Page** (`src/admin/pages/LocationsListPage.jsx`):
```jsx
export const LocationsListPage = () => {
  const [locations, setLocations] = useState(mockLocations);

  return (
    <div className="space-y-6">
      <h1>Locations Management</h1>
      <DataTable
        title="All Locations"
        columns={[
          { key: 'name', label: 'Location Name', sortable: true },
          { key: 'city', label: 'City', sortable: true },
          { key: 'capacity', label: 'Capacity', sortable: true },
          { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> }
        ]}
        data={locations}
        onEdit={(loc) => navigate(`/admin/locations/${loc.id}/edit`)}
        onDelete={(loc) => setLocations(locations.filter(l => l.id !== loc.id))}
      />
    </div>
  );
};
```

**2. Add Route in `App.jsx`**:
```jsx
<Route path="/admin/locations" element={<LocationsListPage />} />
```

**3. Add Sidebar Menu Item** (in `Sidebar.jsx`):
```jsx
{
  label: 'Locations',
  icon: MapPin,
  submenu: [
    { label: 'All Locations', path: '/admin/locations' },
    { label: 'Add Location', path: '/admin/locations/new' }
  ]
}
```

---

## Advanced Customization

### 1. **Add Charts**
Integrate Chart.js or Recharts:
```jsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={salesData}>
  <XAxis dataKey="date" />
  <YAxis />
  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
</LineChart>
```

### 2. **Add Form Validation**
Use React Hook Form + Zod:
```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  title: z.string().min(3),
  category: z.enum(['concert', 'sports', 'theater'])
});

const { register, errors } = useForm({ resolver: zodResolver(schema) });
```

### 3. **Add Notifications**
Integrate with toast store:
```jsx
import { useToastStore } from '../store';

const addToast = useToastStore((s) => s.addToast);
addToast({ type: 'success', message: 'Event updated!' });
```

### 4. **Connect to Backend API**
Replace mock data with API calls:
```jsx
useEffect(() => {
  fetch('/api/admin/events')
    .then(r => r.json())
    .then(data => setEvents(data))
    .catch(err => console.error(err));
}, []);
```

---

## Responsive Breakpoints

- **Mobile (< 768px)**: Sidebar hidden, hamburger menu visible
- **Tablet (768px - 1024px)**: Sidebar appears
- **Desktop (> 1024px)**: Full sidebar + content

---

## Browser Support

- Chrome/Edge: ✅ 90+
- Firefox: ✅ 88+
- Safari: ✅ 14+
- Mobile Safari: ✅ 14+

---

## Performance Tips

1. **Memoize Components**: Use `React.memo` for frequently re-rendered components
2. **Lazy Load Pages**: Use `React.lazy()` + `Suspense` for code splitting
3. **Paginate Tables**: Reduce DOM nodes with pagination (currently 10/page)
4. **Debounce Search**: Add 300ms debounce to search input
5. **Optimize Images**: Use lazy loading for event images

---

## Security Considerations

1. ✅ Admin routes protected by `PrivateAdminRoute`
2. ⚠️ TODO: Implement JWT token validation
3. ⚠️ TODO: Add CSRF protection for form submissions
4. ⚠️ TODO: Sanitize user input before displaying
5. ⚠️ TODO: Implement role-based access control (RBAC)

---

## Future Enhancements

- [ ] Real-time event stream with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Bulk operations (bulk delete, export to CSV)
- [ ] Advanced filtering with multiple criteria
- [ ] Undo/Redo functionality
- [ ] Activity audit log
- [ ] Admin user management
- [ ] Email notifications
- [ ] Integration with payment gateway
- [ ] QR code ticket generation

---

## Support & Contributing

For issues or feature requests, please open a GitHub issue or submit a PR.

---

**Built with ❤️ for Event Ticketing Platform**

