

## Internal Operations Dashboard

### Overview
Create a `/admin` page with role-based access control using a `user_roles` table. The dashboard will have three sections: **User Management**, **Invitation Codes**, and **User Activity Analytics**.

### Database Changes

1. **Create `app_role` enum and `user_roles` table**:
   - Enum: `admin`, `user`
   - Table: `user_roles(id, user_id, role)` with RLS via `has_role()` security definer function
   - RLS policy: only admins can read `user_roles`

2. **Create `admin-stats` edge function**:
   - Fetches user list from `auth.admin.listUsers()` using service role key
   - Returns: total users, registration dates, last sign-in, email, per-user job counts
   - Protected: checks caller has admin role before returning data

3. **Seed your account as admin** via insert tool after migration

### New Files

| File | Purpose |
|------|---------|
| `src/pages/Admin.tsx` | Main admin dashboard page with 3 tabs |
| `src/components/admin/UserTable.tsx` | User list with email, join date, last active, job count |
| `src/components/admin/InvitationCodesPanel.tsx` | View/create/toggle invitation codes |
| `src/components/admin/UserActivityPanel.tsx` | Per-user activity: jobs created, interviews analyzed, active days |
| `supabase/functions/admin-stats/index.ts` | Edge function to fetch auth.users + aggregated stats |

### UI Layout

```text
┌─────────────────────────────────────────────┐
│  Operations Dashboard                       │
├──────────┬──────────────┬───────────────────┤
│ Users(10)│ Invite Codes │ User Activity     │
├──────────┴──────────────┴───────────────────┤
│                                             │
│  [Selected Tab Content]                     │
│                                             │
│  Users Tab:                                 │
│  ┌─────────────────────────────────────┐    │
│  │ KPI Cards: Total / Today / Active   │    │
│  ├─────────────────────────────────────┤    │
│  │ Table: Email | Joined | Last Active │    │
│  │        | Jobs | Status              │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Invite Codes Tab:                          │
│  ┌─────────────────────────────────────┐    │
│  │ [+ Create Code]                     │    │
│  │ Table: Code | Used/Max | Status     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  User Activity Tab:                         │
│  ┌─────────────────────────────────────┐    │
│  │ Per-user: jobs, interviews analyzed,│    │
│  │ recent_activities count, last action│    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Route & Access Control

- Add `/admin` route in `App.tsx` wrapped in `<ProtectedRoute>` + new `<AdminRoute>` component
- `AdminRoute` checks `user_roles` table for admin role; redirects non-admins to `/`
- Sidebar: admin link only visible to users with admin role (icon: `Shield`)

### Key Implementation Details

- `has_role()` security definer function prevents RLS recursion
- Edge function uses `SUPABASE_SERVICE_ROLE_KEY` to call `auth.admin.listUsers()` (cannot query auth.users from client)
- Invitation codes CRUD uses existing table directly from client (add RLS for admin-only write access)
- No changes to existing user-facing features

