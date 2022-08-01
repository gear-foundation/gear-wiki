import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '../components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <h1 className={styles.title}>Wellcome to {siteConfig.title}</h1>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link
                        className={styles.button}
                        to="/docs/intro">
                        Star develop now - 5min ⏱️
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
