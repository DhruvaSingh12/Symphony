# Symphony Redesign: Complete Shadcn UI Refactor

## Overview
Migrate all custom components to shadcn/ui while preserving functionality, design intent, and monochrome theme.

---

## Phase 1: Component Audit & Mapping

### Existing Custom Components Analysis

#### Core UI Components
- **Button.tsx**: Custom button with Tailwind classes, twMerge
  - Intent: Rounded buttons with hover/disabled states
  - shadcn equivalent: `ui/button` with variant system

- **Box.tsx**: Container with neutral-900 bg, rounded corners
  - Intent: Card-like container for sections
  - shadcn equivalent: `ui/card` or direct Tailwind on divs

- **Modal.tsx**: Backdrop overlay with centered dialog
  - Intent: Generic modal wrapper
  - shadcn equivalent: `ui/dialog`

#### Media Components
- **MediaItem.tsx**: Song row with image, title, author, play button
  - Intent: Compact horizontal song card
  - shadcn equivalent: Custom using `Card`, `Avatar`, `Button`

- **SongItem.tsx**: Vertical song card with image, title, artist, album dropdown, like button
  - Intent: Grid item for song library
  - shadcn equivalent: `Card` with `Avatar`, `Badge`, `DropdownMenu`

- **ListItem.tsx**: Home page quick-access tiles with image and play overlay
  - Intent: Featured content grid
  - shadcn equivalent: `Card` with hover overlay

#### Data Components
- **Table.tsx**: Full song table with sortable columns, play, artist/album modals
  - Intent: Desktop spreadsheet-style library view
  - shadcn equivalent: shadcn `Table` or custom DataTable pattern

- **Sort.tsx**: Dropdown for sorting (date, title, artist, album)
  - Intent: Sort selector
  - shadcn equivalent: `Select` component

#### Action Components
- **PlayButton.tsx**: Circular play icon with hover effect
  - Intent: Trigger playback
  - shadcn equivalent: `Button` with `Play` icon from lucide-react

- **LikeButton.tsx**: Heart icon toggle for liked songs
  - Intent: Add/remove from liked songs
  - shadcn equivalent: `Button` with `Heart` icon, toggle variant

#### Modal Components
- **AuthModal.tsx**: Auth dialog with Supabase UI tabs (sign in/sign up)
  - Intent: Authentication flow
  - shadcn equivalent: `Dialog` with `Tabs`

- **AlbumModal.tsx**: Sheet with album details and songs
  - Intent: Album detail view
  - shadcn equivalent: `Sheet` or `Dialog`

- **ArtistModal.tsx**: Sheet with artist songs and albums
  - Intent: Artist detail view
  - shadcn equivalent: `Sheet` or `Dialog`

#### Layout Components
- **Header.tsx**: Top nav with back/forward, home/search mobile, user avatar, logout, theme toggle
  - Intent: Page header with navigation and auth controls
  - Actions: Already has ThemeToggleButton; refactor buttons to shadcn

- **Sidebar.tsx**: Left nav with logo, home/search/library links, playlists, user songs
  - Intent: Main navigation sidebar
  - Actions: Use `ScrollArea`, `Separator`, shadcn `Button` for nav items

- **SidebarItem.tsx**: Individual nav link with icon and label
  - Intent: Nav item
  - shadcn equivalent: `Button` with `asChild` and Next Link

---

## Phase 2: Refactor Plan by Area

### 2.1 Layout & Navigation
- **Header**: 
  - Replace custom Button with shadcn Button
  - Use shadcn Avatar for user profile
  - Add DropdownMenu for user actions (account, logout)
  - Keep theme toggle, simplify gradient logic
  
- **Sidebar**:
  - Wrap content in ScrollArea
  - Use Separator between sections
  - Replace SidebarItem with shadcn Button + Link pattern
  - Use Badge for counts

### 2.2 Authentication & Modals
- **AuthModal**: 
  - Wrap in Dialog
  - Use Tabs for sign in/sign up
  - Keep Supabase Auth UI or replace with shadcn Form + Input
  
- **AlbumModal / ArtistModal**:
  - Use Sheet for slide-in panel
  - Header with title and close button
  - ScrollArea for song list
  - Card for each song with play/like actions

### 2.3 Media & Content Display
- **MediaItem**:
  - Horizontal Card layout
  - Avatar for artwork
  - Typography for title/author
  - Button for play action
  
- **SongItem**:
  - Vertical Card
  - AspectRatio wrapper for image
  - Badge for album
  - DropdownMenu for actions (add to playlist, like, details)
  - Play button overlay on hover
  
- **ListItem**:
  - Card with hover effect
  - Play button overlay
  - Image with AspectRatio

### 2.4 Data Tables & Lists
- **Table**:
  - Use shadcn Table component
  - Custom header with sort controls
  - Rows with play button, artist/album links
  - Integrate Sort dropdown in header
  
- **Sort**:
  - Replace with Select component
  - Keep existing sort options

### 2.5 Action Buttons
- **PlayButton**:
  - shadcn Button with Play icon
  - Variant: ghost or default
  - Size: icon
  
- **LikeButton**:
  - shadcn Button with Heart icon
  - Toggle filled/outline based on isLiked state
  - Use Tooltip for feedback

### 2.6 Pages
- **Home (site/page.tsx, PageContent)**:
  - Use Card grid for songs
  - Skeleton loaders for loading state
  - Badge for section labels
  
- **Search**:
  - Already refactored with shadcn (Tabs, Command, Card, etc.)
  
- **Library**:
  - Tabs for "Songs" and "Playlists"
  - Card grid for content
  - Dialog for upload modal
  
- **Liked**:
  - ScrollArea for song list
  - Card or Table for songs
  
- **Artist**:
  - Tabs for "Songs" and "Albums"
  - Input for search
  - Card grid for results
  
- **Account**:
  - Form with Input, Textarea
  - Card for profile section
  - Button for save/logout

### 2.7 Player
- **Player.tsx / PlayerContent.tsx**:
  - Use Slider for progress and volume
  - Button for play/pause, skip, shuffle, repeat
  - Tooltip for controls
  - Card for player container
  - Keep existing audio playback logic

---

## Phase 3: Implementation Strategy

### Step-by-step execution:
1. **Audit existing components** (read all files, understand interactions)
2. **Start with layout** (Header, Sidebar) to establish navigation structure
3. **Refactor modals** (AuthModal, AlbumModal, ArtistModal) for core interactions
4. **Migrate media components** (MediaItem, SongItem, ListItem, Table)
5. **Update action buttons** (PlayButton, LikeButton)
6. **Refactor pages** (home, library, liked, artist, account)
7. **Update Player** (maintain playback logic)
8. **Clean up old components** (delete unused files)
9. **Build & test** (verify all functionality)

### Design Consistency Rules:
- **Monochrome palette**: Use CSS variables from globals.css (no custom colors)
- **Rounded corners**: Maintain rounded-full for buttons/inputs where appropriate
- **Hover states**: Preserve existing hover interactions (opacity, scale, bg change)
- **Spacing**: Use consistent gap/padding (p-4, gap-4, etc.)
- **Typography**: Keep existing font hierarchy (text-3xl for h1, text-sm for labels)
- **Icons**: Use lucide-react icons throughout
- **Animations**: Use Tailwind transitions, shadcn's built-in animations

---

## Phase 4: Testing Checklist
- [ ] Theme toggle works on all pages
- [ ] Navigation (sidebar, header) works
- [ ] Search with tabs and command palette functional
- [ ] Play/pause/skip controls work
- [ ] Like button toggles and persists
- [ ] Upload modal opens and submits
- [ ] Auth modal sign in/sign up flow works
- [ ] Artist/album modals display and filter correctly
- [ ] Sorting in tables works
- [ ] All pages render without errors
- [ ] Mobile responsive (sidebar collapses, header adapts)
- [ ] Build passes without type errors

---

## Notes
- Keep all Supabase queries, hooks, and auth logic unchanged
- Preserve existing URL routing and page structure
- Maintain player state management (zustand)
- Keep existing image loading and URL hooks
- Ensure all existing features (upload, account edit, playlists) still work
