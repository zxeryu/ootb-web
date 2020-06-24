import React, { useState } from "react";
import { IRouteMeta, SwitchRoutes } from "../core/route";
import { map } from "lodash";
import { NavLink } from "react-router-dom";
import { Layout } from "antd";
import { EachMenus } from "../component/menu/EachMenus";
const { Content, Sider } = Layout;

const HeaderHeight = "3em";

export const MainHeader = ({ route }: { route: IRouteMeta }) => {
  return (
    <header>
      <div css={{ height: HeaderHeight }}>
        {map(route.children, (sub) => {
          if (!sub.path) {
            return null;
          }
          return (
            <NavLink to={sub.path}>
              <span key={sub.path}>{sub.title}</span>
            </NavLink>
          );
        })}
      </div>
    </header>
  );
};

export const MainAdmin = ({ route }: { route: IRouteMeta }) => {
  const [collapsed, setCollapsed] = useState<boolean>();
  return (
    <Layout>
      <Sider
        css={{ height: `calc(100vh - ${HeaderHeight})`, overflow: "auto" }}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}>
        <EachMenus route={route} />
      </Sider>
      <Layout>
        <Content>
          <SwitchRoutes route={route} />
        </Content>
      </Layout>
    </Layout>
  );
};

export const Main = ({ route }: { route: IRouteMeta }) => {
  return (
    <Layout>
      <MainHeader route={route} />
      <Layout>
        <Content>
          <SwitchRoutes route={route} />
        </Content>
      </Layout>
    </Layout>
  );
};
