/**
 * Create and export comfig variabls
 */

 // container for all environments
const environments = {};

// staging (default) env
environments.staging = {
  port: 3000,
  envName: 'staging'
};

environments.production = {
  port: 5000,
  envName: 'production'
};

// determine which environment  was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check  that the current environment is one of the environments above, if not,  default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;

