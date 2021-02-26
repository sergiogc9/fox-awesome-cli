import ConfigStore from 'configstore';

import pkg from '../../package.json';

const config = new ConfigStore(pkg.name);

export default config;
