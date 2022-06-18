/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const { buildPackage } = require('@sergiogc9/js-bundle');

const isWatchMode = process.argv.includes('--watch');

const performBuild = async () => {
	await buildPackage({
		entryPoint: 'src/cli.ts',
		esbuildOptions: {
			platform: 'node'
		},
		isWatchMode
	});
};

performBuild();
