export interface RoleRoutes {
  path: string;
  name: string;
  component: string;
  meta: {
    title: string;
    icon: string;
    externalLinks: boolean;
    type: string;
    status: number;
    [key: string]: unknown;
  };
  children?: RoleRoutes[];
}
