import getRepository  from './get-repository'
import lookupModule   from './lookup-module'
import resolveModule  from './resolve-module'

// https://regex101.com/r/wM7aS1/2
const moduleNameRegex = /^((?:@[\w\-]+\/)?[\w\-]+)(?:@([^\n]+))?$/;
const protocol = window.location.protocol;


export default async function getModuleRequest(name, parentRequire, config) {
  let multiverConfig = config.config.multiver;


  let repository;
  if (multiverConfig.repository) {
    try {
      repository = await getRepository(parentRequire, multiverConfig);
    } catch (e) {
      console.debug(`Can't load repository -`, e);
    }
  }

  // multiver!#repository -> repository obj
  if (name === '#repository') {
    return onload(repository);
  }

  let isFallBack = !!multiverConfig.fallBackToParentRequire;

  let match = name.match(moduleNameRegex);
  let moduleName = match[1];
  let moduleVersionRange = match[2];

  let path;
  // try to find module in repository
  try {
    path = await lookupModule(parentRequire, repository, moduleName, moduleVersionRange);
    path = protocol + path;
  } catch (e) {
    console.debug(`Can't find module ${name} in repository -`, e);
  }

  // try to resolve module with resolver
  if (!path) {
    try {
      path = await resolveModule(multiverConfig.resolver, moduleName, moduleVersionRange);
    } catch (e) {
      console.debug(
        `Can't resolve module ${name} with resolver -`, e);
    }
  }

  if (!path && isFallBack) {
    path = name;
  }

  if (path) {
    return path;
  } else {
    throw new Error(`Can't resolve module [${name}]`)
  }
}
