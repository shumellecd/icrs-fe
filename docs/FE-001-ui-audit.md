# FE-001 - UI Reusability and Duplication Audit

**Project:** `icrs-fe`  
**Task:** Review existing UI elements (buttons, tables, cards, containers, labels, text, and input fields) and identify duplicate implementations.  
**Expected output:** A list of reusable components and duplication hotspots.

## 1. Current reusable component foundation

The current frontend already follows a Bootstrap 5 + Alpine.js component direction. Generic primitives are kept under `src/components/`, feature-specific components under `src/features/`, and the Auth page also owns two page-local components.

| Reusable item | Location | Responsibility | Audit note |
|---|---|---|---|
| Button | `src/components/button/` | Shared `.btn-gcg` / `.btn-gcg-link` presentation | Good base, but feature buttons still define their own variants |
| Card | `src/components/card/` | Shared GCG card and Auth hero card patterns | Good base, but feature cards/panels remain separate |
| Data Table | `src/components/dataTable/` | Search, filter, sort state, query generation, debounce | Strong reusable behavior; no literal table duplication is present in this ZIP |
| Filled Input | `src/components/inputFilled/` | Filled Bootstrap input/select variant | Reusable visual primitive, but it does not cover validation/helper/read-only patterns |
| Generic Modal | `src/components/modal/` | Content-agnostic open/close modal state and shell styles | Strong candidate for broader reuse by feature dialogs |
| Navigation Tabs | `src/components/navTabs/` | Shared active-tab state | Reusable logic primitive |
| Text Label | `src/components/textLabel/` | Shared form label and required marker styles | Useful base; field controls/error/helper states are still duplicated |
| App Header | `pages/auth/appHeader.*` | Auth-page header | Page-local rather than generic component library |
| File Upload | `pages/auth/fileUpload.*` | File selection/drop, validation, clear/reset | Reusable behavior exists but currently remains page-local |
| Add/Edit User | `src/features/addEditUser/` | User modal state, edit population, submit/deactivate flow | Feature-reusable, but form/control styles and validation are locally implemented |
| GOCC Card | `src/features/goccCard/` | Add/edit GOCC state, validation and submit | Feature-reusable, but form styles/validation overlap other forms |
| Profile Settings | `src/features/profileSettings/` | Editable profile identifiers and read-only account fields | Feature-reusable, but input/read-only styles overlap other forms |
| Open Season | `src/features/openSeason/` | Season modal behavior | Modal/action styling overlaps other dialogs |
| View Encoding / Editor | `src/features/viewEncoding/` | Editor and export/submit interactions | Contains its own action styles |
| Logout | `src/features/logOut/` | Logout confirmation behavior | Rebuilds modal/action styling already represented by shared modal concepts |

## 2. Duplication hotspots

### P1 - Form controls, labels, helper/error states

The same field responsibilities appear in several class families:

- Auth: `.form-label-gcg`, `.form-label-req`, Bootstrap `.form-control`, `.form-select`, `.is-invalid`, `.invalid-feedback`
- Add/Edit User: `.user-form-label`, `.user-form-input`, `.user-form-select`, `.user-helper-text`
- Profile Settings: `.profile-label`, `.profile-input`, `.profile-input-readonly`
- GOCC: `.gocc-form-label`, `.gocc-form-req`, `.gocc-form-input`, `.gocc-form-select`, `.gocc-form-error`

They independently define borders, radii, spacing, focus states, disabled/read-only states, required markers, and error presentation.

**Action:** FE-003 should create the shared form-field primitive and validation pattern.

### P1 - Validation logic

Validation is duplicated in different forms:

- `pages/auth/index.html`: separate Sign-In and Registration checks, including repeated email-regex logic.
- `src/features/addEditUser/addEditUser.js`: required-field checks performed in `submitUser()`.
- `src/features/goccCard/goccCard.js`: separate keyed `validate()` implementation.

The result is inconsistent error structure and duplicated common rules.

**Action:** FE-003 should centralize common required/email/length validation while allowing feature-specific messages.

### P1 - Buttons

The project has a shared `.btn-gcg` base, but feature styles also define button families such as:

- Add/Edit User: `.btn-user-action`, `.btn-user-cancel`, `.btn-user-submit`, `.btn-user-deactivate`
- Open Season: `.btn-modal-cancel`, `.btn-modal-submit`, `.btn-modal-view`, `.btn-modal-done`
- Logout: `.btn-logout-cancel`, `.btn-logout-confirm`
- View Encoding: download/editor action variants

There are 25 `<button>` elements in the supplied page/template files.

**Action:** FE-002 should consolidate equivalent primary, secondary, danger, text-link, and export actions.

### P2 - Cards, panels, and containers

The shared `card` component exists, but feature CSS still defines card-like shells such as profile cards, user summary/status cards, GOCC cards, and modal content panels.

**Action:** FE-004 should reuse Bootstrap card structure plus a small set of GCG variants.

### P2 - Modal/dialog shells

A generic modal component already exists in `src/components/modal/`, while Add/Edit User, Logout, Open Season, and View Encoding maintain feature-specific modal wrappers, headers, footers, and action layouts.

**Action:** future refactoring should keep feature state/content in `src/features/` and reuse the generic modal shell where compatible.

### P2 - Visual tokens and hard-coded colors

The supplied CSS contains repeated hard-coded brand/system colors. In the audited source, common values include:

- `#ffffff`: 33 occurrences
- `#f8f9fa`: 22 occurrences
- `#1a3673`: 22 occurrences
- `#1e3a8a`: 11 occurrences
- `#c0392b`: 4 occurrences
- `#d32f2f`: 5 occurrences

**Action:** FE-007 should move repeated brand, danger, neutral, spacing, and typography values into the shared Sass/theme layer.

### Low - Tables

No literal `<table>` element appears in the supplied page/template files. `src/components/dataTable/` already centralizes search/filter/sort behavior.

**Action:** reuse `dataTable` when actual reporting tables are implemented; avoid creating another search/filter/sort state implementation.

### Low - File upload

The Auth page already contains `fileUpload.js` with reusable file handling behavior.

**Action:** consider moving it into `src/components/` once another page needs file upload instead of copying the logic.

## 3. FE-001 priority matrix

| Priority | Hotspot | Main areas | Follow-up |
|---|---|---|---|
| P1 | Form fields and validation | Auth, Add/Edit User, GOCC, Profile Settings | FE-003 |
| P1 | Buttons | Shared button + feature action classes | FE-002 |
| P1 | Color/spacing/typography tokens | Component and feature CSS | FE-007 |
| P2 | Cards/panels | Shared card + profile/user/GOCC panels | FE-004 |
| P2 | Modal shells | Generic modal + feature dialogs | Shared component refactor |
| P2 | Containers/layout | Page and modal layout wrappers | FE-005 |
| Low | Tables | `dataTable` | Reuse existing component |
| Low | File upload | Auth page-local component | Promote when reuse is needed |

## 4. Application-design alignment

The audit prioritizes the forms that correspond directly to the supplied E-ICRS Application Design draft:

- Sign-In / Registration forms.
- System Configuration - User Management Add/Edit forms.
- Account - Profile Settings form.

These screens repeatedly rely on labels, required indicators, editable inputs, select controls, read-only/disabled fields, helper text, and validation feedback, which is why form standardization is the highest-priority duplication hotspot.

## 5. FE-001 conclusion

The codebase already has a useful shared-component base. The largest remaining reuse gap is not tables; it is the field/validation system, followed by action buttons, modal shells, cards/panels, and shared visual tokens. FE-003 is therefore the direct next implementation step from this audit.
