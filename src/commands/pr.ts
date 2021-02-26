import { Argv, Arguments } from 'yargs';
import inquirer from 'inquirer';
import open from 'open';

import * as git from 'lib/git';
import { catchError } from 'lib/error';
import { execSilentWithThrow } from 'lib/shell';
import log from 'lib/log';

interface CommandArgs extends Arguments {
	target?: string;
	draft: boolean;
}

const name = 'pr';
const description = 'Creates a new pull request';

const config = (yargs: Argv) => {
	return yargs
		.usage('foxcli pr [options]')
		.version(false)
		.help('help')
		.option('help', { alias: 'h' })
		.option('draft', {
			describe: 'Create the PR as draft (if supported)',
			type: 'boolean',
			default: false
		})
		.option('target', {
			describe: 'Use custom branch as target branch for the PR',
			type: 'string'
		});
};

const handler = (args: CommandArgs) => {
	catchError(async () => {
		git.checkGitInstallation();

		const currentBranch = git.getCurrentBranch();
		const targetBranch = args.target || git.getSourceBranchFromBranch(currentBranch);

		const answer = await inquirer.prompt<{ description: string; title: string }>([
			{
				name: 'title',
				message: `Enter the title:`,
				type: 'input',
				validate: title => title.trim().length > 0
			},
			{
				name: 'description',
				message: `Enter the description. Leave empty to not provide a description:\n`,
				type: 'editor'
			}
		]);

		const prTitle = answer.title.trim();
		const prDescription = answer.description.trim();

		log.text('Pushing changes...');
		try {
			execSilentWithThrow('git push');
		} catch (e) {
			if (e.message && e.message.match('has no upstream branch')) {
				execSilentWithThrow(`git push --set-upstream origin ${currentBranch}`);
			} else throw e;
		}

		const repoServer = await git.getRepoServer();
		const gitProvider = git.getGitProvider(repoServer);

		log.text('Creating pull request...');
		const prUrl = await gitProvider.createPullRequest({
			from: currentBranch,
			to: targetBranch,
			title: prTitle,
			description: prDescription,
			isDraft: args.draft
		});

		log.success('Pull request created:');
		log.info(prUrl);
		open(prUrl);
	});
};

export default { config, description, handler, name };
