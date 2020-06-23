import React from "react";
import { IRouteMeta } from "../../core/route";
import { Menu } from "antd";
import { size, map } from "lodash";

export const EachMenus = ({ route }: { route: IRouteMeta }) => {
  return (
    <Menu mode={"inline"}>
      {map(route.children, (sub) => {
        if (size(sub.children) > 0) {
          return (
            <Menu.SubMenu key={sub.path} title={sub.title}>
              {map(sub.children, (ss) => {
                return <Menu.Item key={ss.path}>{ss.title}</Menu.Item>;
              })}
            </Menu.SubMenu>
          );
        }
        return <Menu.Item key={sub.path}>{sub.title}</Menu.Item>;
      })}
    </Menu>
  );
};
