import { Argv } from 'yargs';
import inquirer, { QuestionCollection } from 'inquirer';
import chalk from 'chalk';

import configStore from 'lib/config';
import log from 'lib/log';
import { catchError } from 'lib/error';
import { getRepoRemoteUrl } from 'lib/git';

interface CommandArgs {
	all?: boolean;
	clear?: boolean;
	path?: boolean;
	edit?: boolean;
}

const name = 'config';
const description = 'Manage the data saved used by this cli tool and modify some configuration saved.';

const config = (yargs: Argv) => {
	return yargs
		.usage('foxcli config [options]')
		.version(false)
		.help('help')
		.option('help', { alias: 'h' })
		.option('path', {
			alias: 'p',
			describe: 'Show path where config data is located',
			type: 'boolean'
		})
		.option('all', {
			alias: 'a',
			describe: 'Show all config data saved',
			type: 'boolean'
		})
		.option('clear', {
			alias: 'c',
			describe: 'Clear all save config data',
			type: 'boolean'
		});
};

const __showPath = () => {
	log.text(configStore.path);
};

const __getAllData = () => {
	log.text(JSON.stringify(configStore.all, null, 2));
};

const __clearData = () => {
	configStore.clear();
	log.text('All saved data has been cleared!');
};

const __removeGitProviderData = async () => {
	const questions: QuestionCollection = [
		{
			name: 'provider',
			type: 'rawlist',
			message: 'Select the git provider to remove the data:',
			choices: [
				{
					name: 'Remove all',
					value: 'all'
				},
				{
					name: 'Github',
					value: 'github'
				},
				{
					name: 'Bitbucket',
					value: 'bitbucket'
				},
				{
					name: 'Azure',
					value: 'azure'
				}
			]
		}
	];
	const answers = await inquirer.prompt<{
		provider: 'all' | 'github' | 'bitbucket' | 'azure';
	}>(questions);

	let providersKey = 'git.providers';
	if (answers.provider !== 'all') providersKey += `.${answers.provider}`;

	configStore.delete(providersKey);
	log.text('Data removed successfully!');
};

const __removeGitProjectData = async () => {
	const remoteUrl = getRepoRemoteUrl();
	const gitProjectKey = `git.repo.${remoteUrl.replace(/\.+/g, '\\.')}`;
	configStore.delete(gitProjectKey);
	log.text('Data removed successfully!');
};

const __changeGitDefaultBranch = async (branch: string) => {
	const savedBranch = configStore.get(`git.branch.${branch}`) || branch;
	log.text('');
	log.text(`Your ${branch} branch is ${chalk.blueBright.bold(savedBranch)}`);
	const questions: QuestionCollection = [
		{
			name: 'branch',
			type: 'input',
			message: 'Enter the branch you want to use:',
			default: savedBranch
		}
	];
	const answers = await inquirer.prompt<{ branch: string }>(questions);
	configStore.set(`git.branch.${branch}`, answers.branch);
	log.text(`Your ${branch} branch has been set to ${chalk.greenBright.bold(answers.branch)}`);
};

const __changeGitDefaultBranches = async () => {
	await __changeGitDefaultBranch('main');
	await __changeGitDefaultBranch('develop');
};

const __changeGitDefaultWorkflow = async () => {
	const currentWorkflow: GitWorkflow = configStore.get(`git.workflow.default`) || 'only_main';
	log.text('');
	if (currentWorkflow === 'only_main')
		log.text(`Your are currently using a ${chalk.blueBright.bold('continuous deployment')} workflow.`);
	else if (currentWorkflow === 'main_and_develop')
		log.text(`Your are currently using a ${chalk.blueBright.bold('git-flow')} workflow.`);
	const questions: QuestionCollection = [
		{
			name: 'workflow',
			type: 'rawlist',
			message: 'Select an workflow:',
			choices: [
				{
					name: 'Continuous deployment (only one main branch)',
					value: 'only_main'
				},
				{
					name: 'Git-flow (one main branch and one develop branch)',
					value: 'main_and_develop'
				}
			]
		}
	];
	const answers = await inquirer.prompt<{ workflow: string }>(questions);
	configStore.set(`git.workflow.default`, answers.workflow);
	log.text(
		`Your workflow has been set to ${
			answers.workflow === 'only_main'
				? chalk.greenBright.bold('continuous deployment')
				: chalk.greenBright.bold('git-flow')
		}`
	);
};

const __exitConfig = async () => {
	log.info('Exited without changes');
	process.exit();
};

const handler = (args: CommandArgs) => {
	catchError(async () => {
		if (args.path) return __showPath();
		if (args.all) return __getAllData();
		if (args.clear) return __clearData();

		const questions: QuestionCollection = [
			{
				name: 'option',
				type: 'rawlist',
				message: 'Select an option:',
				choices: [
					{
						name: 'Show all config data',
						value: 'all'
					},
					{
						name: 'Get config location',
						value: 'path'
					},
					{
						name: "Clear all config data (can't be undone)",
						value: 'clear'
					},
					new inquirer.Separator(),
					{
						name: 'Change git default branches',
						value: 'changeGitBranches'
					},
					{
						name: 'Change git default workflow',
						value: 'changeGitWorkflow'
					},
					{
						name: 'Remove git provider personal data (token, username, etc)',
						value: 'removeGitProvider'
					},
					{
						name: 'Remove current git project data',
						value: 'removeGitProject'
					},
					{
						name: 'Exit',
						value: 'exit'
					}
				]
			}
		];
		const answers = await inquirer.prompt<{
			option:
				| 'all'
				| 'clear'
				| 'path'
				| 'removeGitProvider'
				| 'removeGitProject'
				| 'changeGitBranches'
				| 'changeGitWorkflow'
				| 'exit';
		}>(questions);

		if (answers.option === 'path') return __showPath();
		if (answers.option === 'all') return __getAllData();
		if (answers.option === 'clear') return __clearData();
		if (answers.option === 'changeGitBranches') return __changeGitDefaultBranches();
		if (answers.option === 'changeGitWorkflow') return __changeGitDefaultWorkflow();
		if (answers.option === 'removeGitProvider') return __removeGitProviderData();
		if (answers.option === 'removeGitProject') return __removeGitProjectData();
		if (answers.option === 'exit') return __exitConfig();
	});
};

export default { config, description, handler, name };
