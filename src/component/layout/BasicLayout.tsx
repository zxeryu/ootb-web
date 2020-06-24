import { Layout } from "antd";
import React, { ReactNode, useState } from "react";
const { Header, Footer, Sider, Content } = Layout;

export interface ILayoutProps {
  children?: ReactNode;
  nav?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export const NavLeftLayout = ({
  children,
  nav,
  header,
  height = "100vh",
}: ILayoutProps & { height?: string | number }) => {
  const [collapsed, setCollapsed] = useState<boolean>();
  return (
    <Layout>
      <Sider css={{ height, overflow: "auto" }} collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        {nav}
      </Sider>
      <Layout>
        {header && <Header>{header}</Header>}
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};

export const NavTopLayout = ({ children, header, footer }: ILayoutProps) => {
  return (
    <Layout>
      <header>{header}</header>
      <Content>{children}</Content>
      {footer && <Footer>{footer}</Footer>}
    </Layout>
  );
};
