import getModuleRequest from './get-module-request'

export default {
  load(name, parentRequire, onload, config) {
    getModuleRequest(name, parentRequire, config)
      .then(function (request) {
        parentRequire([request], onload, onload.error);
      })
      .catch(onload.error);
  }
}