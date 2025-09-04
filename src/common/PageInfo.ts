import { DEFAULT_PAGE, DEFAULT_PAGESIZE } from "./constants";
import { CategoryBeanList } from "./CategoryBeanList";
import { OptionBeanList } from "./OptionBeanList";

export type Order = "asc" | "desc";

export interface PageInfo {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortMode?: Order;
}

export const PageInfo_Default: PageInfo = {
  pageNum: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGESIZE,
  sortField: "",
  sortMode: "asc",
};

export interface PageResult<T> {
  contents?: T[];
  total?: number;
}

export interface RowDefine {
  key: string;
}

export interface CellParams<T extends RowDefine> {
  row: T;
}

export interface ColomnDefine<T extends RowDefine> {
  field: string;
  headerName: string;
  renderCell?: (params: CellParams<T>) => React.ReactNode;

  align?: "inherit" | "left" | "center" | "right" | "justify";

  /**
   * Set the width of the column.
   * @default 100
   */
  width?: number;

  /**
   * Sets the minimum width of a column.
   * @default 50
   */
  minWidth?: number;

  filterType?: "input" | "select" | "date" | "month";

  /**
   * If 'filterType'='select', this is the option list of select filter.
   */
  options?: OptionBeanList[] | CategoryBeanList[];

  /**
   * the column can been hide.
   * @default false
   *
   * if set true, awalys show.
   */
  fixed?: boolean; // Can't been hide
  textWrap?: boolean;
  /**
   * is hide column
   * @default false
   *
   * true: hide column
   * false: show column
   *
   * If 'fixed'=true, this field can't been set.
   */
  hide?: boolean;

  /**
   * When click table head, can do data sort.
   * @default: false
   *
   * true: can't sort by this column
   * false: can sort by this column
   */
  hideSort?: boolean;
  showFormat?: string;
  valueFormat?: string;
}

export interface EditRowDefine extends RowDefine {
  isHide?: boolean;
}
