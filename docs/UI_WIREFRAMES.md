# UI Wireframes & Design Guidelines

## 1. Global Layout
- **Sidebar**: Fixed on the left, collapsible. Contains links to Dashboard, Projects, CI/CD, Infrastructure, Monitoring, Security, Settings.
- **Top Navbar**: Contains global search bar, user profile dropdown, dark/light mode toggle, and notification bell.
- **Main Content Area**: Scrollable area displaying the active view.

## 2. Dashboard Wireframe
```text
+-------------------------------------------------------------+
| [Logo] | Search...                  [Theme] [Bell] [Profile]|
+--------+----------------------------------------------------+
| Home   | Overview                                           |
| Projs  | +-------------+ +-------------+ +-------------+    |
| CI/CD  | | Active      | | Failed      | | Security    |    |
| Infra  | | Deployments | | Builds      | | Alerts      |    |
| Monitor| |      12     | |      2      | |      5      |    |
| Secur  | +-------------+ +-------------+ +-------------+    |
| Sets   |                                                    |
|        | [ CPU Usage Chart ]  [ Memory Usage Chart ]        |
|        |                                                    |
|        | Recent Activity Table                              |
|        | - PR #45 Merged (2 mins ago)                       |
|        | - Prod Deployment Success (1 hr ago)               |
+--------+----------------------------------------------------+
```

## 3. Design System (Shadcn UI & TailwindCSS)
- **Colors**: Slate/Zinc scales for structural elements. Indigo/Blue for primary actions. Rose/Red for destructive actions/alerts.
- **Typography**: Inter (sans-serif) for clean readability.
- **Components**:
  - `DataTables` with pagination, sorting, and filtering for resources (Pods, Projects).
  - `Cards` for metric summaries.
  - `Toasts` for success/error notifications.
  - `Skeletons` for loading states.
