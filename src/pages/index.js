import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import HomepageFeatures from '../components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className={styles.title}>
          <Translate>Wellcome to Gear Documentation Portal</Translate>
        </h1>
        <p className="hero__subtitle">
          <Translate>The place to start developing with Gear</Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className={styles.button}
            to="/docs/getting-started-in-5-minutes">
            <Translate>
              Start develop now - 5min ⏱️
            </Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
