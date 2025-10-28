export const TAB_ITEMS = {
  CREATE_OPTIONS: "create-options",
  MANAGE_LIQUIDITY: "manage-liquidity",
  OPTIONS_HISTORY: "options-history",
  FLASHBET: "flashbet",
} as const;

export type TabItem = (typeof TAB_ITEMS)[keyof typeof TAB_ITEMS];