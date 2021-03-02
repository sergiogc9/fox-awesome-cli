import chalk from 'chalk';
import inquirer from 'inquirer';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { Base64 } from 'js-base64';

import configStore from 'lib/config';
import log from 'lib/log';
import { getRepoRemoteUrl } from 'lib/git';
import GitProvider from 'providers/git';

class AzureProvider extends GitProvider {
	constructor() {
		super();
		this.__server = 'azure';
	}

	public createPullRequest: GitProvider['createPullRequest'] = async options => {
		const { id, organization, project, name } = await this.__getRepoInfo();
		try {
			const data = await this.__doRequest<{ pullRequestId: number }>(
				organization,
				'POST',
				`${organization}/${project}/_apis/git/repositories/${id}/pullrequests`,
				{
					description: options.description.length ? options.description : undefined,
					isDraft: options.isDraft,
					sourceRefName: `refs/heads/${options.from}`,
					targetRefName: `refs/heads/${options.to}`,
					title: options.title
				}
			);
			return `https://dev.azure.com/${organization}/${project}/_git/${name}/pullrequest/${data.pullRequestId}`;
		} catch (e) {
			if (e.response?.data?.message) {
				throw {
					message: e.response.data.message
				};
			}
			throw e;
		}
	};

	protected __askProviderToken: GitProvider['__askProviderToken'] = async () => {
		log.text(
			'The cli needs a valid Azure personal access token (PAT) with enough permissions to perform the actions. More info at:'
		);
		log.info(
			'https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page'
		);
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

	private __doRequest = async <T = unknown>(organization: string, method: Method, path: string, data?: unknown) => {
		const token = await this.__getProviderToken();
		const encodedToken = Base64.encode(`${organization}:${token}`);
		const config: AxiosRequestConfig = {
			method,
			url: `https://dev.azure.com/${path}`,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			headers: { Authorization: `Basic ${encodedToken}` }
		};
		if (method === 'GET') config.params = data;
		else config.data = data;
		config.params = { ...config.params, 'api-version': '6.0' };
		return (await axios.request<T>(config)).data;
	};

	private __getRepoInfo = async () => {
		const repoUrl = getRepoRemoteUrl();
		const repoDataConfigKey = `git.repo.${repoUrl.replace(/\.+/g, '\\.')}`;
		let repoId: string = configStore.get(`${repoDataConfigKey}.id`);
		let repoOrganization: string = configStore.get(`${repoDataConfigKey}.organization`);
		let repoProject: string = configStore.get(`${repoDataConfigKey}.project`);
		let repoName: string = configStore.get(`${repoDataConfigKey}.name`);
		if (!repoOrganization) {
			repoOrganization = await this.__detectRepoOrganization(repoUrl);
			configStore.set(`${repoDataConfigKey}.organization`, repoOrganization);
		}
		if (!repoProject) {
			repoProject = await this.__detectRepoProject(repoUrl);
			configStore.set(`${repoDataConfigKey}.project`, repoProject);
		}
		if (!repoName) {
			repoName = await this.__detectRepoName(repoUrl);
			configStore.set(`${repoDataConfigKey}.name`, repoName);
		}
		if (!repoId) {
			repoId = await this.__fetchRepoId(repoOrganization, repoProject, repoName);
			configStore.set(`${repoDataConfigKey}.id`, repoId);
		}
		return { id: repoId, name: repoName, organization: repoOrganization, project: repoProject };
	};

	private __fetchRepoId = async (organization: string, project: string, name: string) => {
		const data = await this.__doRequest<{ id: string }>(
			organization,
			'GET',
			`${organization}/${project}/_apis/git/repositories/${name}`
		);
		return data.id;
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

	private __detectRepoOrganization = async (remoteUrl: string) => {
		const { organization: repoOrganization } = this.__getRepoDataFromUrl(remoteUrl);

		if (repoOrganization) {
			const answer = await inquirer.prompt<{ isCorrect: boolean }>([
				{
					name: 'isCorrect',
					message: `Looks like this repository organization is ${chalk.blueBright(repoOrganization)}. Is this correct?`,
					type: 'confirm',
					default: false
				}
			]);
			if (answer.isCorrect) return repoOrganization;
		} else log.warn('Not able to detect repository organization...');

		const answer = await inquirer.prompt<{ organization: string }>([
			{
				name: 'organization',
				message: 'Who is the repository organization?',
				type: 'input'
			}
		]);
		return answer.organization;
	};

	private __detectRepoProject = async (remoteUrl: string) => {
		const { project: repoProject } = this.__getRepoDataFromUrl(remoteUrl);

		if (repoProject) {
			const answer = await inquirer.prompt<{ isCorrect: boolean }>([
				{
					name: 'isCorrect',
					message: `Looks like this repository project is ${chalk.blueBright(repoProject)}. Is this correct?`,
					type: 'confirm',
					default: false
				}
			]);
			if (answer.isCorrect) return repoProject;
		} else log.warn('Not able to detect repository project...');

		const answer = await inquirer.prompt<{ project: string }>([
			{
				name: 'project',
				message: 'Which is the repository project?',
				type: 'input'
			}
		]);
		return answer.project;
	};

	private __getRepoDataFromUrl = (remoteUrl: string) => {
		if (remoteUrl.startsWith('https')) {
			const regexMatch = remoteUrl.match(/^.*dev\.azure\.com\/(.*)\/(.*)\/_git\/(.*)$/);
			const [, organization, project, name] = regexMatch;
			return { organization, project, name };
		}
		const regexMatch = remoteUrl.match(/^.*dev\.azure\.com[:v[0-9]*]*\/(.*)\/(.*)\/(.*)$/);
		const [, organization, project, name] = regexMatch;
		return { organization, project, name };
	};
}

export default AzureProvider;
