// Flat key -> string label file. English only for now (no locale switcher
// exists yet) - add sibling files (e.g. locales/zh/labels.ts) and register
// them in src/config/i18n.ts when a second locale is actually needed.
// Existing hardcoded strings across the app are not being swept over to
// this wholesale in one pass - use it going forward, and migrate a page's
// strings here as you touch that page.
const labels = {
  COMMON_SAVE: "Save",
  COMMON_CANCEL: "Cancel",
  COMMON_DELETE: "Delete",
  COMMON_EDIT: "Edit",
  COMMON_SEARCH: "Search",
  COMMON_LOADING: "Loading...",
  COMMON_CONFIRM_DELETE: "Are you sure you want to delete this?",
};

export default labels;
