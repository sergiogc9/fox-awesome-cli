import chalk from 'chalk';
import inquirer from 'inquirer';
import axios, { AxiosRequestConfig, Method } from 'axios';

import configStore from 'lib/config';
import log from 'lib/log';
import GitProvider from 'providers/git';
import { getRepoRemoteUrl } from 'lib/git';

class BitbucketProvider extends GitProvider {
	constructor() {
		super();
		this.__server = 'bitbucket';
	}

	public createPullRequest: GitProvider['createPullRequest'] = async options => {
		const { workspace, name } = await this.__getRepoInfo();
		try {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const data = await this.__doRequest<{ links: { html: { href: string } } }>(
				'POST',
				`repositories/${workspace}/${name}/pullrequests`,
				{
					description: options.description,
					destination: {
						branch: {
							name: options.to
						}
					},
					source: {
						branch: {
							name: options.from
						}
					},
					title: options.title
				}
			);
			return data.links.html.href;
		} catch (e) {
			if (e.response?.data?.error?.message)
				throw {
					message: e.response.data.error.message
				};
			throw e;
		}
	};

	protected __askProviderToken: GitProvider['__askProviderToken'] = async () => {
		log.text('The cli needs a valid Bitbucket app password with enough permissions to perform the actions. More info:');
		log.info('https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/');
		const answer = await inquirer.prompt<{ token: string }>([
			{
				name: 'token',
				message: 'Enter the app password:',
				type: 'input',
				validate: title => title.trim().length > 0
			}
		]);
		return answer.token;
	};

	private __getBitbucketUsername = async () => {
		const configKey = `git.providers.${this.__server}.username`;
		let username: string = configStore.get(configKey);
		if (!username) {
			log.text(
				'This cli needs your bitbucket username in order to work call the Bitbucket API. When asked, provide the username, which is not the login email! You can check your username here:'
			);
			log.info('https://bitbucket.org/account/settings/');
			const answer = await inquirer.prompt<{ username: string }>([
				{
					name: 'username',
					message: 'Enter your bitbucket username:',
					type: 'input',
					validate: u => u.trim().length > 0
				}
			]);
			username = answer.username;

			if (!username) throw { message: 'Token not provided, exiting.' };
			configStore.set(configKey, username);
		}
		return username;
	};

	private __doRequest = async <T = unknown>(method: Method, path: string, data?: unknown) => {
		const username = await this.__getBitbucketUsername();
		const appPassword = await this.__getProviderToken();
		const config: AxiosRequestConfig = {
			method,
			url: `https://api.bitbucket.org/2.0/${path}`,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			auth: { username, password: appPassword }
		};
		if (method === 'GET') config.params = data;
		else config.data = data;
		return (await axios.request<T>(config)).data;
	};

	private __getRepoInfo = async () => {
		const repoUrl = getRepoRemoteUrl();
		const repoDataConfigKey = `git.repo.${repoUrl.replace(/\.+/g, '\\.')}`;
		let repoWorkspace: string = configStore.get(`${repoDataConfigKey}.workspace`);
		let repoName: string = configStore.get(`${repoDataConfigKey}.name`);
		if (!repoWorkspace) {
			repoWorkspace = await this.__detectRepoWorkspace(repoUrl);
			configStore.set(`${repoDataConfigKey}.workspace`, repoWorkspace);
		}
		if (!repoName) {
			repoName = await this.__detectRepoName(repoUrl);
			configStore.set(`${repoDataConfigKey}.name`, repoName);
		}
		return { name: repoName, workspace: repoWorkspace };
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

	private __detectRepoWorkspace = async (remoteUrl: string) => {
		const { workspace: repoWorkspace } = this.__getRepoDataFromUrl(remoteUrl);

		if (repoWorkspace) {
			const answer = await inquirer.prompt<{ isCorrect: boolean }>([
				{
					name: 'isCorrect',
					message: `Looks like this repository workspace is ${chalk.blueBright(repoWorkspace)}. Is this correct?`,
					type: 'confirm',
					default: false
				}
			]);
			if (answer.isCorrect) return repoWorkspace;
		} else log.warn('Not able to detect repository workspace...');

		const answer = await inquirer.prompt<{ workspace: string }>([
			{
				name: 'workspace',
				message: 'Who is the repository workspace?',
				type: 'input'
			}
		]);
		return answer.workspace;
	};

	private __getRepoDataFromUrl = (remoteUrl: string) => {
		const regexMatch = remoteUrl.match(/^.*@bitbucket\.org[:|/](.*)\/(.*)\.git$/);
		const [, workspace, name] = regexMatch;
		return { name, workspace };
	};
}

export default BitbucketProvider;
