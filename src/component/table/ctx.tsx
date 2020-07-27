import { createContext, useContext } from "react";
import { ColumnType } from "antd/es/table/interface";

export interface ITableContext<T> {
  columns: ColumnType<T>[];
  updateColumns?: (_: ColumnType<T>[]) => void;
}

export const OTableContext = createContext<ITableContext<any>>({
  columns: [],
});

export const OTableContextProvider = OTableContext.Provider;

export const useOTableContext = () => useContext(OTableContext);

export const useOTableColumns = () => useOTableContext().columns;
