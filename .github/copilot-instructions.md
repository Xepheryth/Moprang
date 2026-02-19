# KANS Monitoring - AI Agent Guidelines

## Project Overview
KANS is a lightweight shipment monitoring application for tracking goods delivery from vendors to users, organized by project. It's a client-side JavaScript application with no backend—all data is stored in memory within the `shipments` array in `script.js`.

## Architecture & Data Flow

### Core Data Model
- **Shipments Array** (`script.js`, line 2-7): Central in-memory data store
  - Schema: `{ id, item, vendor, user, project, progress }`
  - Projects are derived from unique shipment entries (no separate project table)
  - Progress is numeric (0-100%), incremented by 10% via `updateProgress()`

### Component Structure
- **HTML** (`index.html`): Page structure with two main sections
  - `#shipments`: Display filtered shipments with progress bars
  - `#add-shipment`: Form to add new shipments
  - Grid layout (`.parent/.div1-4`) is structural but not currently integrated with content
- **JavaScript** (`script.js`): All application logic
  - `renderProjectFilter()`: Dynamically populates project dropdown from unique shipments
  - `renderShipments(filterProject)`: Renders filtered shipment list with buttons for progress updates
  - Form submission handler auto-updates dropdown if new project is added
- **CSS** (`style.css`): Yellow theme styling with progress bar animations

### Key Integration Points
1. **Project Filter**: Dropdown refreshes whenever new shipments are added (line 95-96)
2. **Progress Updates**: Modifying `shipment.progress` triggers re-render (line 67-71)
3. **Form Reset**: All input fields cleared after successful submission (line 99-102)

## Critical Patterns & Conventions

### Data Mutation & UI Updates
- **Pattern**: Modify data array → call appropriate render function
- **Example**: `updateProgress()` mutates object, then calls `renderShipments()` with current filter
- **Note**: No state management library; keep data and DOM in sync manually

### Event Delegation & Dynamic Content
- `renderShipments()` recreates all shipment DOM elements on each call (inefficient but simple)
- Use `document.getElementById()` directly—no frameworks or query selectors
- Event listeners attached at page load, not dynamically

### Form Handling
- Uses `e.preventDefault()` to block default submission
- Validates required fields via HTML5 (no JS validation)
- New project names are auto-capitalized by user (no normalization)

### Styling Conventions
- **Yellow color scheme**: `#FFD700` (primary), `#FFA500` (accent)
- **Theme**: Light yellow backgrounds (`#FFFACD`, `#FFFFE0`) with soft borders
- All components use `border-radius: 5-10px` for rounded corners
- Progress bar uses CSS transition for smooth width animation

## Developer Workflows

### Testing & Debugging
- Open `index.html` in browser directly (no server required)
- Inspect `shipments` array in console: `console.log(shipments)`
- Use browser DevTools → Application tab to verify no localStorage/IndexedDB usage

### Adding Features
1. If adding shipment fields: Update schema in initial data AND form inputs
2. If filtering differently: Create new filter function, add UI control (select/checkbox), call `renderShipments()`
3. Keep render functions simple—use string templates over DOM APIs

### Common Gotchas
- **CSS Link Mismatch**: `index.html` line 7 references `styles.css` but actual file is `style.css` — **MUST fix this or styling breaks completely**
- Grid layout (`.parent/.div1-4` in `style.css`) is defined but never used in content—remove if not needed
- No data persistence across page refreshes (all data lost on reload)
- ID auto-incrementing uses `shipments.length + 1` (fragile if items are removed)

## File References
- Core logic: `script.js` (lines 1-103)
- Page structure: `index.html` (critical: form IDs must match JS selectors)
- Styling: `style.css` (update hex values to change theme)

## Quick Start for AI Agents

**To add a new feature:**
1. Identify which category it affects: data model (shipments schema), UI/render (HTML/CSS), or logic (JS functions)
2. Update the data structure first if needed, then update form inputs to collect new fields
3. Modify relevant render functions to display the new information
4. Test by opening `index.html` in a browser and checking browser console for errors

**To debug:**
- Check `shipments` array state: `console.log(shipments)` in browser console
- Verify form submission by inspecting the form inputs against `shipment-form` event listener
- Verify dropdown synchronization by changing projects and checking if `renderProjectFilter()` was called
- Check CSS by inspecting element styles (verify `style.css` is actually loaded, not `styles.css`)
