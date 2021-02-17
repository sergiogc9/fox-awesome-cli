import { Argv } from 'yargs';

import { catchError } from 'lib/error';
import { checkNodeInstallation, getNodePackageManager, getCurrentPackageJson, getPackageVersions } from 'lib/node';
import { execWithThrow } from 'lib/shell';
import log from 'lib/log';

interface CommandArgs {
	push?: boolean;
	update?: string;
}

const name = 'pkg-publish';
const description = 'Publishes the package for current project if current version is not published yet';

const config = (yargs: Argv) => {
	// prettier-ignore
	return yargs
		.usage('foxcli publish [options]')
		.version(false)
		.help('help')
		.option('help', {  alias: 'h'})
		.option('update', {
			alias: 'u',
			choices: ['major', 'minor', 'patch', 'prerelease'],
			describe: 'Update package version before publishing the package'
		}).option('push', {
			alias: 'p',
			describe: 'If set, a push containing the tag is done after updating the version',
			type: 'boolean'
		});
};

const handler = async (args: CommandArgs) => {
	catchError(() => {
		checkNodeInstallation();

		const manager = getNodePackageManager();
		if (manager === 'unknown')
			throw { code: 1, message: 'No package manager found. Please install dependencies before.' };

		const { push, update } = args;
		if (update) {
			log.text('Updating version...');
			if (manager === 'npm') execWithThrow(`npm version ${update}`);
			if (manager === 'yarn') execWithThrow(`yarn version --${update}`);
		}

		if (push) {
			log.text('Pushing new version...');
			execWithThrow('git push --follow-tags');
		}

		const pkgJson = getCurrentPackageJson();
		const pkgName = pkgJson.name as string;
		const pkgVersion = pkgJson.version as string;
		const versions = getPackageVersions(pkgName);

		if (versions.includes(pkgVersion)) {
			return log.info('Current package version already published. Not publishing.');
		}

		log.text(`Publishing version ${pkgVersion} for package ${pkgName}...`);
		if (manager === 'yarn') {
			execWithThrow(`yarn publish --non-interactive`);
		} else if (manager === 'npm') {
			execWithThrow(`npm publish`);
		}
	});
};

export default { config, description, handler, name };
