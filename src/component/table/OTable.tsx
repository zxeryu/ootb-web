import React, { useEffect, useState } from "react";
import { TableProps } from "antd/es/table";
import { omit, map, get, filter, reduce } from "lodash";
import { IToolBarProps, ToolBar } from "./ToolBar";
import { OTableContextProvider, useOTableColumns } from "./ctx";
import { Table } from "antd";
import { ColumnType } from "antd/es/table/interface";

export interface ISelectedObjs<T> {
  keys: React.Key[];
  rows: T[];
}

export interface ActionType<T> {
  // reload: (resetPageIndex?: boolean) => void;
  // reloadAndRest: () => void;
  // fetchMore: () => void;
  // reset: () => void;
  //selected
  clearSelected: () => void;
  getSelected: () => ISelectedObjs<T>;
  setSelected: (_: ISelectedObjs<T>) => void;
}

export interface IOTable<T> {
  //use OTable methods by ref
  actionRef?: React.MutableRefObject<ActionType<T> | undefined> | ((actionRef: ActionType<T>) => void);
  toolBarRender?: IToolBarProps<T>["toolBarRender"];
  toolBarOptions?: IToolBarProps<T>["options"];
  pageTotal?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

const TableComponent = <RecordType extends {}>({
  dataSource,
  rowSelection,
  actionRef,
  toolBarRender,
  toolBarOptions,
  pagination,
  pageTotal = 0,
  onPageChange,
  ...otherProps
}: Omit<TableProps<RecordType>, "columns"> & IOTable<RecordType>) => {
  //columns
  const columns = useOTableColumns();
  //selectRows
  const [selectedRows, setSelectedRows] = useState<ISelectedObjs<RecordType>>({
    keys: [],
    rows: [],
  });
  //pagination
  const [pageInfo, setPageInfo] = useState<{
    page: number;
    pageSize: number;
    pageSizeOptions: string[];
  }>({
    page: get(pagination, "defaultCurrent", 1),
    pageSize: get(pagination, "defaultPageSize", 10),
    pageSizeOptions: get(pagination, "pageSizeOptions", ["10", "20", "30", "50"]),
  });
  //only once
  useEffect(() => {
    onPageChange && onPageChange(pageInfo.page, pageInfo.pageSize);
  }, [pageInfo]);

  //actionRef
  useEffect(() => {
    const userAction: ActionType<RecordType> = {
      clearSelected: () => {
        setSelectedRows({ keys: [], rows: [] });
      },
      getSelected: () => selectedRows,
      setSelected: (selectRows) => {
        setSelectedRows(selectRows);
      },
    };
    if (actionRef && typeof actionRef === "function") {
      actionRef(userAction);
    }
    if (actionRef && typeof actionRef !== "function") {
      actionRef.current = userAction;
    }
  }, [selectedRows]);
  return (
    <div>
      {(toolBarRender || toolBarOptions) && (
        <ToolBar selectObjs={selectedRows} toolBarRender={toolBarRender} options={toolBarOptions} />
      )}
      <Table
        {...otherProps}
        columns={filter(columns, (item) => get(item, "showState", true) as true)}
        dataSource={dataSource}
        rowSelection={
          rowSelection
            ? {
                ...omit(rowSelection, ["selectedRowKeys", "onChange"]),
                selectedRowKeys: selectedRows.keys,
                onChange: (keys: React.Key[], rows: RecordType[]) => {
                  setSelectedRows({ keys, rows });
                },
              }
            : undefined
        }
        pagination={
          pagination || onPageChange
            ? {
                showSizeChanger: true,
                pageSizeOptions: pageInfo.pageSizeOptions,
                total: pageTotal,
                showTotal: (all, range) => {
                  return `第${range[0]}-${range[1]}条 共${all}条`;
                },
                ...omit(pagination || {}, "onChange", "current", "pageSize", "defaultCurrent", "defaultPageSize"),
                current: pageInfo.page,
                pageSize: pageInfo.pageSize,
                onShowSizeChange: (current: number, size: number) => {
                  setPageInfo((prevState) => ({ ...prevState, page: current, pageSize: size }));
                },
                onChange: (page: number, newPageSize?: number) => {
                  setPageInfo((prevState) => ({ ...prevState, page, pageSize: newPageSize || prevState.pageSize }));
                },
              }
            : false
        }
      />
    </div>
  );
};

export const OTable = <RecordType extends {}>({
  columns,
  ...otherProps
}: TableProps<RecordType> & IOTable<RecordType>) => {
  const [oColumns, updateOColumns] = useState<ColumnType<RecordType>[]>([]);

  useEffect(() => {
    const lastState = reduce(
      oColumns,
      (pairs, item) => ({
        ...pairs,
        [`${item?.dataIndex}`]: get(item, "showState", true),
      }),
      {},
    );
    updateOColumns(
      map(columns, (item) => {
        let showState = get(lastState, get(item, "dataIndex"), undefined);
        if (showState === undefined) {
          showState = get(item, "showState", true);
        }
        return { ...item, showState };
      }),
    );
  }, [columns]);

  return (
    <OTableContextProvider value={{ columns: oColumns, updateColumns: updateOColumns as any }}>
      <TableComponent {...otherProps} />
    </OTableContextProvider>
  );
};
