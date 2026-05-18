# EventHub - Event Ticketing Platform

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                    # Base UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.jsx         # Navigation header with theme toggle
│   │   │   ├── Footer.jsx         # Footer with links
│   │   │   ├── Layout.jsx         # Main layout wrapper
│   │   │   └── index.js
│   │   │
│   │   ├── common/                # Shared feature components
│   │   │   ├── Carousel.jsx       # Image carousel
│   │   │   ├── EventCard.jsx      # Event card (grid/list)
│   │   │   ├── EventFilters.jsx   # Filter sidebar
│   │   │   └── index.js
│   │   │
│   │   ├── events/                # Event-specific components
│   │   │   ├── EventHeaderSection.jsx  # Hero + quick info
│   │   │   ├── ReviewsSection.jsx      # Reviews & ratings
│   │   │   └── index.js
│   │   │
│   │   └── tickets/               # Ticket/checkout components
│   │       ├── SeatSelector.jsx   # Venue map & seat selection
│   │       ├── CartSummary.jsx    # Cart/order summary
│   │       └── index.js
│   │
│   ├── pages/                     # Page components
│   │   ├── HomePage.jsx           # Landing page
│   │   ├── EventsListingPage.jsx  # Events grid/list
│   │   ├── EventDetailPage.jsx    # Event detail with tabs
│   │   ├── SeatSelectionPage.jsx  # Seat/sector selection
│   │   ├── CheckoutPage.jsx       # Payment & checkout
│   │   └── index.js
│   │
│   ├── hooks/                     # Custom React hooks
│   │   └── index.js
│   │
│   ├── store/                     # State management (Zustand)
│   │   └── index.js               # Cart, Events, Auth stores
│   │
│   ├── utils/                     # Utility functions
│   │   ├── api.js                 # Axios instance & API calls
│   │   ├── formatting.js          # Format dates, currency, etc.
│   │   └── index.js
│   │
│   ├── constants/                 # App constants
│   │   └── index.js
│   │
│   ├── App.jsx                    # Main app component & router
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Tailwind + custom styles
│
├── index.html                     # HTML template
├── package.json
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
├── vite.config.mts                # Vite configuration
└── README.md
```

## Color Scheme

### Primary Colors
- Blue: `#5c95ff` - Main actions, links
- Secondary: `#e67c50` - Highlights, CTAs
- Accent: `#0ea5e9` - Decorative elements

### Dark Mode
- Supported for all components
- Toggle in header
- Persisted in localStorage

## Component Hierarchy

```
Layout
├── Header (Navigation + Cart + Theme)
├── Main Content
│   ├── HomePage
│   ├── EventsListingPage
│   │   ├── EventFilters
│   │   ├── EventCard (grid/list)
│   │   └── Grid/List View
│   ├── EventDetailPage
│   │   ├── EventHeaderSection
│   │   ├── Tabs (About, Venue, Tickets)
│   │   └── ReviewsSection
│   ├── SeatSelectionPage
│   │   └── SeatSelector
│   └── CheckoutPage
│       └── CartSummary
└── Footer
```

## Key Features

### 1. Home Page
- Hero section with search bar
- Featured events carousel
- Category browsing
- Upcoming events grid
- Newsletter subscription

### 2. Events Listing
- Grid/List view toggle
- Sidebar filters (category, date, city, price)
- Event cards with ratings
- Responsive design

### 3. Event Detail
- Hero image section
- Quick info card (date, time, location, organizer)
- Tabbed interface (About, Venue, Tickets)
- Performing artists
- Venue information with map placeholder
- Ticket options
- Reviews & ratings section

### 4. Seat Selection
- Interactive venue map
- Sector/section buttons with pricing
- Availability status
- Selection summary sidebar
- Progress steps

### 5. Checkout
- Billing information form
- Secure payment form (Stripe-ready)
- Order summary
- Terms and conditions
- Order confirmation

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - API client
- **Date-fns** - Date utilities
- **React Hook Form** - Form handling

## Styling Approach

- **Tailwind CSS** for utility-first styling
- Custom color palette extended in tailwind.config.js
- Dark mode support via `dark:` prefix
- Responsive design with mobile-first approach
- Custom CSS utility classes in index.css

## Design Principles

1. **Clean & Modern** - Minimal, spacious layouts
2. **Accessible** - WCAG compliant components
3. **Responsive** - Mobile-first, works on all devices
4. **Dark Mode** - Full dark mode support
5. **Performance** - Optimized images and lazy loading
6. **User-Focused** - Smooth UX for ticket purchasing

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start dev server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

### Environment Variables
Create a `.env.local` file:
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_KEY=your_stripe_key_here
```

### Tailwind Customization
Edit `tailwind.config.js` to customize:
- Color palette
- Typography
- Spacing
- Animations
- Shadow effects

## API Integration

The app uses Axios with interceptors for:
- Automatic token injection
- Error handling
- Response transformation
- Request/response logging

API endpoints are defined in `utils/api.js`

## State Management

Using Zustand for global state:
- `useCartStore` - Cart items
- `useEventStore` - Events & filters
- `useAuthStore` - Authentication

## Performance Tips

- Code splitting with React Router
- Image optimization with lazy loading
- CSS-in-JS with Tailwind (minimal JS)
- Component memoization where needed
- Debounced search and filters

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
