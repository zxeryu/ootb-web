import { Layout, Menu } from "antd";
import React, { ReactNode } from "react";
import { EachRoutes, IRouteMeta } from "../../core/route";
import { EachMenus } from "../menu/EachMenus";
const { Header, Footer, Sider, Content } = Layout;

export enum ELayoutMode {
  MenuLeft = "MenuLeft",
  MenuTop = "MenuTop",
  MenuTopSubLeft = "MenuTopSubLeft",
}

export type ILayoutMode = keyof typeof ELayoutMode;

export interface IRouteChildren {
  children?: ReactNode;
  route: IRouteMeta;
}

// <Menu.SubMenu title={sub.title}>
//   {console.log("###", sub)}
//   <EachRoutes route={sub}>{(c) => <Menu.Item>{c.title}</Menu.Item>}</EachRoutes>
// </Menu.SubMenu>

export const MenuLeftLayout = ({ children, route }: IRouteChildren) => {
  console.log("@@@@", route);
  return (
    <Layout>
      <Sider>
        <EachMenus route={route} />
      </Sider>
      <Layout>
        <Header>Header</Header>
        <Content>
          Content
          {children}
        </Content>
        <Footer>Footer</Footer>
      </Layout>
    </Layout>
  );
};

export const MenuTopLayout = ({ children }: IRouteChildren) => {
  return (
    <Layout>
      <Header>Header</Header>
      <Content>
        Content
        {children}
      </Content>
      <Footer>Footer</Footer>
    </Layout>
  );
};

export const BasicLayout = ({
  children,
  mode = ELayoutMode.MenuLeft,
  route,
}: IRouteChildren & {
  mode?: ILayoutMode;
}) => {
  if (mode === ELayoutMode.MenuTop || mode === ELayoutMode.MenuTopSubLeft) {
    return <MenuTopLayout route={route}>{children}</MenuTopLayout>;
  }
  return <MenuLeftLayout route={route}>{children}</MenuLeftLayout>;
};
