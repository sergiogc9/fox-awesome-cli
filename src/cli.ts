import yargs from 'yargs';

import defaultHandler from 'commands/default';
import config from 'commands/config';
import branchCreate from 'commands/branch-create';
import branchSync from 'commands/branch-sync';
import isBranchSynced from 'commands/is-branch-synced';
import pkgManager from 'commands/pkg-manager';
import pkgPublish from 'commands/pkg-publish';
import pkgVersion from 'commands/pkg-version';
import pr from 'commands/pr';
import push from 'commands/push';
import info from 'commands/info';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs(process.argv.slice(2))
	.version()
	.option('help', { alias: 'h' })
	.option('version', { alias: 'v' })
	.command(
		'$0',
		'',
		y =>
			y
				.usage('Usage: foxcli <command> [options]')
				.usage('Usage: fox <command> [options]')
				.usage('Usage: fcli <command> [options]'),
		() => defaultHandler(process.argv.slice(2))
	)
	// General commands
	.command(config.name, config.description, config.config, config.handler)
	.command(info.name, info.description, info.config, info.handler)
	// Node commands
	.command(pkgManager.name, pkgManager.description, pkgManager.config, pkgManager.handler)
	.command(pkgPublish.name, pkgPublish.description, pkgPublish.config, pkgPublish.handler)
	.command(pkgVersion.name, pkgVersion.description, pkgVersion.config, pkgVersion.handler)
	// Git commands
	.command(branchCreate.name, branchCreate.description, branchCreate.config, branchCreate.handler)
	.command(branchSync.name, branchSync.description, branchSync.config, branchSync.handler)
	.command(isBranchSynced.name, isBranchSynced.description, isBranchSynced.config, isBranchSynced.handler)
	.command(pr.name, pr.description, pr.config, pr.handler)
	.command(push.name, push.description, push.config, () => push.handler(process.argv.slice(2))).argv;
