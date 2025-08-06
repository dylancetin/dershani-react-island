import { dirname, join } from 'node:path';
import type { StorybookConfig } from 'storybook-react-rsbuild';

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const reactIslandsUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/mf`
        : ''
      : process.env.VERCEL_ENV === 'preview'
        ? process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}/mf`
          : ''
        : '';

console.log('Module federation base set as: ', reactIslandsUrl);

const config: StorybookConfig = {
  stories: [
    '../src/stories/**/*.mdx',
    '../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  framework: {
    name: getAbsolutePath('storybook-react-rsbuild'),
    options: {},
  },
  addons: [
    {
      name: getAbsolutePath('storybook-addon-rslib'),
      options: {
        rslib: {
          include: ['**/stories/**'],
        },
      },
    },
    {
      name: '@module-federation/storybook-addon/preset',
      options: {
        // add your rslib module manifest here for storybook dev
        // we have set dev.assetPrefix and server.port to 3001 in rslib.config.ts above
        remotes: {
          react_islands:
            // you can also add shared here for storybook app
            // shared: {}
            //  process.env.NODE_ENV
            `react_islands@${reactIslandsUrl + '/mf-manifest.json'}`,
        },
      },
    },
  ],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
