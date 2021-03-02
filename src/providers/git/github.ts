import chalk from 'chalk';
import inquirer from 'inquirer';
import axios, { AxiosRequestConfig, Method } from 'axios';

import configStore from 'lib/config';
import log from 'lib/log';
import GitProvider from 'providers/git';
import { getRepoRemoteUrl } from 'lib/git';

class GithubProvider extends GitProvider {
	constructor() {
		super();
		this.__server = 'github';
	}

	public createPullRequest: GitProvider['createPullRequest'] = async options => {
		const { owner, name } = await this.__getRepoInfo();
		try {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const data = await this.__doRequest<{ html_url: string }>('POST', `/repos/${owner}/${name}/pulls`, {
				base: options.to,
				body: options.description,
				draft: options.isDraft,
				head: options.from,
				title: options.title
			});
			return data.html_url;
		} catch (e) {
			if (e.response.status === 422)
				throw {
					message:
						'Could not create the PR. This happens if branches are equal or an existing PR between branches already exists.'
				};
			throw e;
		}
	};

	protected __askProviderToken: GitProvider['__askProviderToken'] = async () => {
		log.text(
			'The cli needs a valid Github personal access token (PAT) with enough permissions to perform the actions. More info:'
		);
		log.info('https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token');
		const answer = await inquirer.prompt<{ token: string }>([
			{
				name: 'token',
				message: 'Enter personal access token:',
				type: 'input',
				validate: title => title.trim().length > 0
			}
		]);
		return answer.token;
	};

	private __doRequest = async <T = unknown>(method: Method, path: string, data?: unknown) => {
		const token = await this.__getProviderToken();
		const config: AxiosRequestConfig = {
			method,
			url: `https://api.github.com${path}`,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			headers: { Authorization: `token ${token}` }
		};
		if (method === 'GET') config.params = data;
		else config.data = data;
		return (await axios.request<T>(config)).data;
	};

	private __getRepoInfo = async () => {
		const repoUrl = getRepoRemoteUrl();
		const repoDataConfigKey = `git.repo.${repoUrl.replace(/\.+/g, '\\.')}`;
		let repoOwner: string = configStore.get(`${repoDataConfigKey}.owner`);
		let repoName: string = configStore.get(`${repoDataConfigKey}.name`);
		if (!repoOwner) {
			repoOwner = await this.__detectRepoOwner(repoUrl);
			configStore.set(`${repoDataConfigKey}.owner`, repoOwner);
		}
		if (!repoName) {
			repoName = await this.__detectRepoName(repoUrl);
			configStore.set(`${repoDataConfigKey}.name`, repoName);
		}
		return { name: repoName, owner: repoOwner };
	};

	private __detectRepoName = async (remoteUrl: string) => {
		const { name: repoName } = this.__getRepoDataFromUrl(remoteUrl);

		if (repoName) {
			const answer = await inquirer.prompt<{ isCorrect: boolean }>([
				{
					name: 'isCorrect',
					message: `Looks like this repository name is ${chalk.blueBright(repoName)}. Is this correct?`,
					type: 'confirm',
					default: false
				}
			]);
			if (answer.isCorrect) return repoName;
		} else log.warn('Not able to detect repository name...');

		const answer = await inquirer.prompt<{ name: string }>([
			{
				name: 'name',
				message: 'Which is the repository name?',
				type: 'input'
			}
		]);
		return answer.name;
	};

	private __detectRepoOwner = async (remoteUrl: string) => {
		const { owner: repoOwner } = this.__getRepoDataFromUrl(remoteUrl);

		if (repoOwner) {
			const answer = await inquirer.prompt<{ isCorrect: boolean }>([
				{
					name: 'isCorrect',
					message: `Looks like this repository owner is ${chalk.blueBright(repoOwner)}. Is this correct?`,
					type: 'confirm',
					default: false
				}
			]);
			if (answer.isCorrect) return repoOwner;
		} else log.warn('Not able to detect repository owner...');

		const answer = await inquirer.prompt<{ owner: string }>([
			{
				name: 'owner',
				message: 'Who is the repository owner?',
				type: 'input'
			}
		]);
		return answer.owner;
	};

	private __getRepoDataFromUrl = (remoteUrl: string) => {
		const regexMatch = remoteUrl.match(/^.*github.com[:|/](.*)\/(.*)\.git/);
		const [, owner, name] = regexMatch;
		return { name, owner };
	};
}

export default GithubProvider;
