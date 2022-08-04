import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import styles from './HomepageFeatures.module.scss';

import Translate from '@docusaurus/Translate';

const FeatureList = [
  {
    title: <Translate>Intro to Gear Protocol</Translate>,
    id: 'into',
    link: '/docs/gear/glossary',
    description: <Translate>Get to know the main features of Gear’s advanced engine for smart contracts.</Translate>,
  },
  {
    title: <Translate>Start building</Translate>,
    id: 'start-build',
    link: '/docs/getting-started-in-5-minutes',
    description: <Translate>Use the guide to create your first smart contract in just 5 minutes.</Translate>
  },
  {
    title: <Translate>Run Gear node</Translate>,
    id: 'run',
    link: '/docs/node/setting-up',
    description: <Translate>Install, compile and run the Gear Node!</Translate>
  },
  {
    title: <Translate>Intecating with Gear Node</Translate>,
    id: 'api',
    link: '/docs/api/getting-started',
    description: <Translate>Discover a set of tools and API for creating user interface applications that interact with Gear smart-contracts.</Translate>
  },
  {
    title: <Translate>Developing smart contracts</Translate>,
    id: 'develop',
    link: '/docs/developing-contracts/gear-program',
    description: <Translate>Dive into the main aspects and principles of developing smart contracts on Gear Protocol!</Translate>
  },
  {
    title: <Translate>Smart contract examples</Translate>,
    id: 'examples',
    link: '/docs/examples/prerequisites',
    description: <Translate>Experiment with our smart contract examples, try to play around with the code and create your own dApp!</Translate>
  },
];

function Feature({ link, title, description, id }) {
  return (
    <div className={clsx('col col--4')}>
      <Link className={styles.link} to={link}>
        <div className={clsx(styles['feature'], styles[id])}>
          <div className={styles.header}>
            <h3>{title}</h3>
          </div>
          <div className={styles.body}>
            <p>{description}</p>
          </div>
        </div>
      </Link>
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
