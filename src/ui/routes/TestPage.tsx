import { Link, Navbar, Page } from 'framework7-react';
import type { FC } from 'react';

export const TestPage: FC = () => (
  <Page name="test">
    <Navbar title="Test Page" backLink />
    <Link href="/">Go To Home Page</Link>
    {new Array(500).fill(null).map((_, i) => (
      <p key={i.toString()}>Line {i}</p>
    ))}
  </Page>
);
