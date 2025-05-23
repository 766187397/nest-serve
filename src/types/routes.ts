export interface RoleRoutes {
  path: string;
  name: string;
  component: string;
  meta: any;
  children?: RoleRoutes[];
}
