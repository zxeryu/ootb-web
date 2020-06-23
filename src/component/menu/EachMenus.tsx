import React from "react";
import { IRouteMeta } from "../../core/route";
import { Menu } from "antd";
import { size, map } from "lodash";

export const EachMenu = ({ route }: { route: IRouteMeta }) => {
  // if (route.children && size(route.children) > 0) {
  //   return (
  //     <Menu.SubMenu title={route.title}>
  //       {map(route.children, (sub) => (
  //         <EachMenu route={sub} />
  //       ))}
  //     </Menu.SubMenu>
  //   );
  // }
  return <Menu.Item key={route.path}>{route.title}</Menu.Item>;
};

export const EachMenus = ({ route }: { route: IRouteMeta }) => {
  return (
    <Menu mode={"inline"}>
      {map(route.children, (sub) => (
        <Menu.Item key={sub.path}>{sub.title}</Menu.Item>
      ))}
    </Menu>
  );
};
