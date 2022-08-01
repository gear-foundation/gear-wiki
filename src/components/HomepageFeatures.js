import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Intro to Gear Protocol',
    link: '/docs/gear/glossary',
    description: (
      <>
        Get started building your decentralized app or marketplace....
      </>
    ),
  },
  {
    title: 'Start building',
    link: '/docs/getting-started-in-5-minutes',
    description: (
      <>
        Get started building your decentralized app or marketplace....
      </>
    ),
  },
  {
    title: 'Run Gear node',
    link: '/docs/node/setting-up',
    description: (
      <>
        Get started building your decentralized app or marketplace....
      </>
    ),
  },
  {
    title: 'API for interacting with Gear node',
    link: '/docs/api/getting-started',
    description: (
      <>
        Get started building your decentralized app or marketplace....
      </>
    ),
  },
  {
    title: 'Developing smart contracts',
    link: '/docs/developing-contracts/gear-program',
    description: (
      <>
        Get started building your decentralized app or marketplace....
      </>
    ),
  },
  {
    title: 'Smart contract examples',
    link: '/docs/examples/prerequisites',
    description: (
      <>
        Get started building your decentralized app or marketplace....
      </>
    ),
  },
];

function Feature({ link, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <a class={styles.link} href={link}>
        <div class={styles.feature}>
          <div class={styles.header}>
            <h3>{title}</h3>
          </div>
          <div class={styles.body}>
            <p>{description}</p>
          </div>
        </div>
      </a>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
