import { Argv, Arguments } from 'yargs';
import inquirer, { QuestionCollection } from 'inquirer';
import chalk from 'chalk';

import * as git from 'lib/git';
import { catchError } from 'lib/error';
import { execSilentWithThrow } from 'lib/shell';
import log from 'lib/log';

interface CommandArgs extends Arguments {
	push?: boolean;
	from?: string;
}
type PromptAnswer = {
	branchType: typeof branchTypes[number];
	description: string;
	issueId?: string;
};
type PromptQuestions = QuestionCollection<PromptAnswer>[];

const branchTypes = ['feat', 'fix', 'chore', 'docs', 'test', 'build', 'refactor', 'release', 'none'] as const;

const name = 'branch-create';
const description = 'Creates a new branch from an updated source branch.';

const config = (yargs: Argv) => {
	return yargs
		.usage('foxcli branch-create [options]')
		.version(false)
		.help('help')
		.option('help', { alias: 'h' })
		.option('from', {
			describe: 'Use custom source branch to create the branch from',
			type: 'string'
		})
		.option('push', {
			alias: 'p',
			default: false,
			describe: 'Push created branch to remote',
			type: 'boolean'
		});
};

const handler = (args: CommandArgs) => {
	catchError(async () => {
		git.checkGitInstallation();

		const questions: PromptQuestions = [
			{
				name: 'branchType',
				message: 'Select the branch type:',
				type: 'list',
				choices: branchTypes.map(type => ({ name: type, value: type }))
			}
		];

		questions.push({
			name: 'issueId',
			message: 'Enter the issue ID: e.g. FEAR-1000\n',
			type: 'input'
		});

		questions.push({
			name: 'description',
			message: 'Enter a description for the branch:\n',
			type: 'input'
		});

		const answers = await inquirer.prompt<PromptAnswer>(questions);

		if (!answers.description.trim()) throw { message: `You must provide a description.` };

		const branchDescription = answers.description.trim().length
			? `${answers.description.toLowerCase().replace(/\s+/g, '_')}`
			: '';
		const newBranch = `${answers.branchType !== 'none' ? `${answers.branchType}-` : ''}${
			answers.issueId ? `${answers.issueId}-` : ''
		}${branchDescription}`;
		const sourceBranch = args.from || git.getSourceBranchFromBranch(newBranch);
		const currentBranch = git.getCurrentBranch();

		// Check if branch exists
		log.text('Checking existing branches...');
		if (git.existsLocalBranch(newBranch)) throw { message: `The branch ${newBranch} already exists.` };
		if (git.existsRemoteBranch(newBranch)) throw { message: `The branch ${newBranch} already exists in remote.` };

		// Update source branch
		log.text(`Pulling most recent changes from branch ${sourceBranch}...`);
		if (currentBranch === sourceBranch) execSilentWithThrow('git pull');
		else execSilentWithThrow(`git fetch origin ${sourceBranch}:${sourceBranch}`);

		// Create new branch from source branch
		log.text('Creating new branch...');
		execSilentWithThrow(`git checkout -b ${newBranch} ${sourceBranch}`);

		// If branch is release, merge content from develop
		if (answers.branchType === 'release') {
			log.text(`Merging most recent changes from ${git.DEVELOP_BRANCH}...`);
			if (currentBranch !== git.DEVELOP_BRANCH) {
				execSilentWithThrow(`git fetch origin ${git.DEVELOP_BRANCH}:${git.DEVELOP_BRANCH}`);
			}
			execSilentWithThrow(`git merge ${git.DEVELOP_BRANCH}`);
		}

		// Push to remote if necessary
		if (args.push) {
			log.text('Pushing branch to remote...');
			execSilentWithThrow(`git push --set-upstream origin ${newBranch}`);
		}

		log.info(`Created and changed to branch ${chalk.bold(newBranch)}`);
	});
};

export default { config, description, handler, name };
