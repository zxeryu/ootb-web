import React, { useCallback, useMemo } from "react";
import { ISelectedObjs } from "./OTable";
import { Divider, Tooltip, Popover, Checkbox, Row, Col } from "antd";
import { useOTableContext } from "./ctx";
import { map, set, get, filter, size } from "lodash";

const ColumnSetting = () => {
  const { columns, updateColumns } = useOTableContext();
  const setAll = useCallback(
    (all: boolean) => {
      updateColumns && updateColumns(map(columns, (item) => ({ ...item, showState: all })));
    },
    [columns],
  );

  const { checked, indeterminate } = useMemo(() => {
    const filters = filter(columns, (item) => get(item, "showState", true));
    return {
      checked: size(filters) === size(columns),
      indeterminate: size(filters) !== 0 && size(filters) !== size(columns),
    };
  }, [columns]);

  return (
    <Popover
      trigger={"click"}
      placement="bottomRight"
      title={
        <div>
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={(e) => {
              setAll(e.target.checked);
            }}>
            列展示
          </Checkbox>
        </div>
      }
      content={
        <div
          css={{
            maxWidth: "20em",
          }}>
          <Row>
            {map(columns, (item, idx) => {
              return (
                <Col key={idx} span={12}>
                  <Checkbox
                    checked={get(item, "showState", true)}
                    onChange={(e) => {
                      //reset columns
                      updateColumns &&
                        updateColumns(
                          map(columns, (item, index) => {
                            if (idx === index) {
                              set(columns[idx], "showState", e.target.checked);
                            }
                            return item;
                          }),
                        );
                    }}>
                    {item.title}
                  </Checkbox>
                </Col>
              );
            })}
          </Row>
        </div>
      }>
      <Tooltip title={"列设置"}>
        <span>列设置</span>
      </Tooltip>
    </Popover>
  );
};

export interface IToolBarProps<T> {
  headerTitle?: string;
  selectObjs?: ISelectedObjs<T>;
  toolBarRender?: (_?: ISelectedObjs<T>) => React.ReactNode;
  options?: {
    columnSetting: boolean;
  };
}

export const ToolBar = <T extends {}>({
  headerTitle,
  selectObjs,
  toolBarRender,
  options = { columnSetting: true },
}: IToolBarProps<T>) => {
  const optionBar = toolBarRender ? toolBarRender(selectObjs) : null;
  const { columnSetting } = options;

  return (
    <div
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "1.2em",
      }}>
      <div>{headerTitle}</div>
      <div>
        {optionBar}
        <Divider type="vertical" />
        {columnSetting && <ColumnSetting />}
      </div>
    </div>
  );
};
