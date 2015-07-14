 const protocol = window.location.protocol;
 let repositoryCache = new WeakMap();

 export default function getRepository(parentRequire, multiverConfig) {
  return new Promise((resolve, reject) => {
    let cachedRepo = repositoryCache.get(parentRequire);
    // return cached repository if present
    if (cachedRepo) {
      return resolve(cachedRepo);
    }
    let repo = multiverConfig.repository;
    // Repository specified as url
    let url;
    if (typeof repo === 'string') {
      if (repo.slice(0, 4) === 'http') {
        url = repo;
        if (protocol === 'https:' && repo.slice(0, 5) === 'http:') {
          return reject(new Error(`Use https protocol in repository url [${repo}]`));
        }
      }
      else if (repo.slice(0, 2) === '//') {
        url = protocol + repo;
      }
      else {
        return reject(new Error(`Unknown format of multiversion repository: ${repo}`))
      }
      parentRequire([url], repository => {
        repositoryCache.set(parentRequire, repository);
        resolve(repository);
      })
    }
  })
}
