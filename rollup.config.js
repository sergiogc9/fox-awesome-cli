// rollup.config.js
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const config = [
	{
		input: 'src/cli.ts',
		output: [
			{
				dir: 'dist',
				format: 'cjs'
			}
		],
		external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
		plugins: [typescript(), json(), terser()]
	}
];

export default config;
