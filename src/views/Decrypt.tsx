import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/layout/Tabs';
import { RouterProps } from 'preact-router';

export default function Decrypt(_props: RouterProps) {
  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body>
        Decrypt.tsx
      </Body>
      <Tabs />
    </Layout>
  )
}
