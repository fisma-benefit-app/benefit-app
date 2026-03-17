# State Management Documentation

This document describes the state management architecture in the Benefit App, focusing on how projects and functional components are managed throughout the application.

## Overview

The app uses React Context API for global state management with two primary contexts:

- **AppUserContext**: Manages authentication and user session
- **ProjectsContext**: Manages all projects and their versions

Local state is used within individual components for UI-specific concerns (e.g., collapse states, form inputs).

---

## Authentication State (`AppUserContext`)

### Location

- Context: `frontend/src/context/AppUserContext.ts`
- Provider: `frontend/src/context/AppUserProvider.tsx`
- Hook: `frontend/src/hooks/useAppUser.tsx`

### State Structure

```typescript
{
  loadingAuth: boolean; // Loading state during auth operations
  appUser: AppUser | null; // Current user info (username)
  loggedIn: boolean; // Authentication status
  sessionToken: string | null; // JWT token for API requests
  setSessionToken: Function; // Update session token
  setLoggedIn: Function; // Update login status
  setAppUser: Function; // Update user info
  logout: Function; // Clear auth state
}
```

### Persistence

- Session token and user info are stored in `sessionStorage`
- Retrieved on app refresh via `useEffect` in `AppUserProvider`
- Cleared on logout (manual or on 401 responses)

### Usage

```typescript
const { sessionToken, logout } = useAppUser();
```

---

## Projects State (`ProjectsContext`)

### Location

- Context: `frontend/src/context/ProjectsContext.ts`
- Provider: `frontend/src/context/ProjectsProvider.tsx`
- Hook: `frontend/src/hooks/useProjects.tsx`

### State Structure

```typescript
{
  sortedProjects: Project[];                    // All projects, sorted by updatedAt (desc)
  loading: boolean;                             // Loading state
  error: string;                                // Error messages
  handleDelete: (projectId) => Promise<void>;   // Delete a project
  checkIfLatestVersion: (project, versions) => boolean;  // Check if project is latest version
  returnLatestOrPreviousVersion: (project, versions) => Project;  // Get previous version for PDF report comparison
  setProjects: (projects) => void;              // Replace / Update all projects
}
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ AppUserProvider                                             │
│ - Manages authentication                                    │
│ - Provides sessionToken                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ ProjectsProvider                                            │
│ - Fetches all projects on mount using sessionToken          │
│ - Stores in local state: projects[]                         │
│ - Provides sortedProjects (sorted by updatedAt desc)        │
│ - Provides CRUD operations                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│ ProjectList      │    │ ProjectPage      │
│ - Lists projects │    │ - Edits project  │
│ - Uses context   │    │ - Local state    │
└──────────────────┘    └──────────────────┘
```

### Key Operations

#### Fetch All Projects

On `ProjectsProvider` mount, fetches all projects from backend:

```typescript
useEffect(() => {
  const getAllProjects = async () => {
    const allProjectsFromDb = await fetchAllProjects(sessionToken);
    setProjects(allProjectsFromDb);
  };
  getAllProjects();
}, [sessionToken]);
```

#### Delete Project

```typescript
const handleDelete = async (projectId: number) => {
  await deleteProject(sessionToken, projectId);
  setProjects((prev) => prev.filter((p) => p.id !== projectId));
};
```

#### Version Management

Projects with the same `projectName` are considered versions. The context provides utilities to:

- Identify the latest version (highest `version` number, most recent `updatedAt`)
- Get the previous version for comparison
- Check if a specific project is the latest version

---

## Individual Project State (`ProjectPage`)

### Location

`frontend/src/components/ProjectPage.tsx`

### State Structure

The `ProjectPage` component manages local state for a single project being edited:

```typescript
{
  project: Project | null; // Current project with all functional components
  projectResponse: ProjectResponse | null; // Last saved response
  loadingProject: boolean; // Loading state
  error: string; // Error messages
  collapseAll: boolean; // Global collapse state
  componentCollapseStates: Map<number, boolean>; // Individual collapse states
  lastAddedComponentId: number | null; // ID of most recently added component
  isConfirmModalOpen: boolean; // Archive version modal state
}
```

### Project Object Structure

```typescript
{
  id: number;
  projectName: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  versionCreatedAt: string;
  functionalComponents: TGenericComponent[];  // Array of components
}
```

### Functional Component Structure

```typescript
{
  id: number;
  className: ClassName; // Component class type
  componentType: ComponentType | null; // Specific type within class
  title: string | null;
  description: string | null;
  degreeOfCompletion: number | null; // 0.0 to 1.0
  isMLA: boolean; // Multi-layer architecture flag
  orderPosition: number; // For drag-and-drop ordering
  // Calculation parameters (class-specific):
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  // Relationships:
  previousFCId: number | null;
  parentFCId: number | null;
}
```

---

## State Updates in ProjectPage

### 1. Fetching a Project

On mount or when `selectedProjectId` changes:

```typescript
useEffect(() => {
  const getProject = async () => {
    const projectFromDb = await fetchProject(sessionToken, projectId);
    // Normalize orderPosition values
    const normalized = projectFromDb.functionalComponents
      .sort((a, b) => a.orderPosition - b.orderPosition)
      .map((c, idx) => ({ ...c, orderPosition: idx }));
    setProject({ ...projectFromDb, functionalComponents: normalized });
  };
  getProject();
}, [selectedProjectId]);
```

### 2. Editing Functional Components

Components update project state immutably via `setProject`:

```typescript
// In FunctionalClassComponent.tsx
const handleComponentChange = (e) => {
  const updatedComponent = { ...component, [e.target.id]: value };
  const updatedComponents = project.functionalComponents.map((fc) =>
    fc.id === component.id ? updatedComponent : fc,
  );
  setProject({ ...project, functionalComponents: updatedComponents });

  if (isLatest) {
    debouncedSaveProject(); // Triggers auto-save
  }
};
```

### 3. Auto-Save Mechanism

Uses a custom debounce hook with a ref to capture the latest state:

```typescript
// Ref always holds latest project state
const projectRef = useRef<Project | null>(null);
useEffect(() => {
  projectRef.current = project;
}, [project]);

// Debounced save reads from ref (not stale closure)
const debouncedSaveProject = useDebounce(async () => {
  const currentProject = projectRef.current;
  if (!currentProject || isManuallySaved.current) return;

  await updateProject(sessionToken, currentProject);
}, 5000);
```

**Why the ref?** The debounce function creates a closure. Without the ref, it would capture a stale `project` value. The ref ensures it always reads the latest state.

### 4. Creating Functional Components

```typescript
const handleCreateFunctionalComponent = async () => {
  await saveProject(); // Save current state first

  const newComponent: TGenericComponentNoId = {
    /* default values */
  };
  const updatedProject = await createFunctionalComponent(
    sessionToken,
    project.id,
    newComponent,
  );

  setProject(updatedProject); // Replace entire project with server response
};
```

### 5. Deleting Functional Components

```typescript
const handleDeleteFunctionalComponent = async (componentId: number) => {
  const updatedProject = await deleteFunctionalComponent(
    sessionToken,
    componentId,
    project.id,
  );
  setProject(updatedProject); // Replace entire project with server response
};
```

### 6. Drag-and-Drop Reordering

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  // Reorder components array
  const updatedComponents = [...project.functionalComponents];
  const [moved] = updatedComponents.splice(oldIndex, 1);
  updatedComponents.splice(newIndex, 0, moved);

  // Update orderPosition values
  const reOrdered = updatedComponents.map((c, index) => ({
    ...c,
    orderPosition: index,
  }));

  setProject({ ...project, functionalComponents: reOrdered });
  // Auto-save triggered via debounce
};
```

---

## Collapse State Management

Collapse state is managed separately to prevent components from collapsing during auto-saves:

```typescript
// Global collapse toggle
const [collapseAll, setCollapseAll] = useState<boolean>(true);

// Individual component collapse states (overrides global)
const [componentCollapseStates, setComponentCollapseStates] = useState<
  Map<number, boolean>
>(new Map());

// Get collapse state: individual state takes precedence
const getComponentCollapseState = (componentId: number): boolean => {
  if (componentCollapseStates.has(componentId)) {
    return componentCollapseStates.get(componentId)!;
  }
  // Fall back to global state
  return collapseAll ? componentId !== lastAddedComponentId : false;
};

// Clear individual states when collapseAll is toggled
useEffect(() => {
  setLastAddedComponentId(null);
  setComponentCollapseStates(new Map()); // Reset all individual states
}, [collapseAll]);
```

---

## Read-Only vs Editable State

### Version Control

Only the **latest version** of a project can be edited:

```typescript
const isLatest = checkIfLatestVersion(project, allProjectVersions);

// Disable inputs if not latest
<input disabled={!isLatest} />

// Prevent auto-save if not latest
if (isLatest) {
  debouncedSaveProject();
}
```

### Creating New Versions

Archiving creates a new version:

```typescript
const saveProjectVersion = async () => {
  await saveProject(); // Save current changes
  const newVersionId = await createNewProjectVersion(sessionToken, project);

  // Refresh projects list
  const updatedProjects = await fetchAllProjects(sessionToken);
  setProjects(updatedProjects);

  navigate(`/project/${newVersionId}`); // Navigate to new version
};
```

---

## Summary: State Flow

```
User Authentication
     ↓
AppUserProvider (sessionToken)
     ↓
ProjectsProvider (fetches all projects)
     ↓
┌────────────────────┬─────────────────────┐
│                    │                     │
ProjectList      ProjectPage         FunctionalPointSummary
(displays)      (local state)         (calculations only)
     ↓                ↓
Filter/Sort      Project + FunctionalComponents
     ↓                ↓
                FunctionalClassComponent
                (updates via setProject)
                     ↓
                Auto-save (debounced)
                     ↓
                Backend API
                     ↓
                Projects state refreshed
```

---

## Best Practices

1. **Immutable Updates**: Always create new objects/arrays when updating state
2. **Optimistic UI**: Update local state immediately, sync with backend asynchronously
3. **Single Source of Truth**: Project state lives in `ProjectPage`, components receive it as props
4. **Refs for Async Closures**: Use refs to access latest state in debounced/async functions
5. **Normalize on Fetch**: Always normalize `orderPosition` after fetching from backend
6. **Version Control**: Check `isLatest` before allowing edits or auto-saves

---

## Common Pitfalls

❌ **Stale closures in debounced functions**

- Use refs to capture latest state

❌ **Mutating state directly**

- Always use spread operators or `map()`

❌ **Not normalizing orderPosition**

- Components may have gaps in order values from database

❌ **Forgetting to check isLatest**

- Users could edit archived versions

✅ **Solution**: Follow the patterns shown in this document
