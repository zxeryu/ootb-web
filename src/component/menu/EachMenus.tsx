import React from "react";
import { IRouteMeta } from "../../core/route";
import { Menu } from "antd";
import { size, map } from "lodash";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";

export const EachMenus = ({ route }: { route: IRouteMeta }) => {
  return (
    <Menu mode={"inline"} theme={"dark"}>
      {map(route.children, (sub) => {
        if (size(sub.children) > 0) {
          return (
            <Menu.SubMenu key={sub.path} title={sub.title} icon={<MenuUnfoldOutlined />}>
              {map(sub.children, (ss) => {
                return <Menu.Item key={ss.path}>{ss.title}</Menu.Item>;
              })}
            </Menu.SubMenu>
          );
        }
        return <Menu.Item key={sub.path}>{sub.fullPath && <NavLink to={sub.fullPath}>{sub.title}</NavLink>}</Menu.Item>;
      })}
    </Menu>
  );
};
