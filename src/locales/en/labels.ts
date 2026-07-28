// Flat key -> string label file. See locales/zh/labels.ts for the Chinese
// counterpart (Header.tsx's language toggle switches between them) -
// existing hardcoded strings across the app are not being swept over to
// this wholesale in one pass, migrate a page's strings here as you touch
// that page (see roles/page.tsx for the pattern).
const labels = {
  COMMON_SAVE: "Save",
  COMMON_CANCEL: "Cancel",
  COMMON_DELETE: "Delete",
  COMMON_EDIT: "Edit",
  COMMON_SEARCH: "Search",
  COMMON_LOADING: "Loading...",
  COMMON_CONFIRM_DELETE: "Are you sure you want to delete this?",
  NAVBAR_ACCOUNT_FALLBACK: "Account",
  NAVBAR_MY_ACCOUNT: "My Account",
  NAVBAR_MY_PROFILE: "My Profile",
  NAVBAR_LOGOUT: "Logout",
};

export default labels;
