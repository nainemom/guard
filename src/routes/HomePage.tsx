import { Link, Navbar, Page } from 'framework7-react';
import type { FC } from 'react';

export const HomePage: FC = () => (
  <Page name="home">
    <Navbar title="Home Page" />
    <Link href="/test">Go To Test Page</Link>
  </Page>
);
