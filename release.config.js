const config = {
	branches: ['main', { name: 'beta', prerelease: true }, { name: 'alpha', prerelease: true }],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		'@semantic-release/changelog',
		'@semantic-release/npm',
		'@semantic-release/github',
		'@semantic-release/git'
	]
};

module.exports = config;
