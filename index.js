
var request = require('request');
var fs = require('fs');
var Q = require('q');
var tmp = require('tmp');
var download = require('./download');
var extract = require('./extract');
var object = require('mout/object');
var path = require('path');

tmp.setGracefulCleanup();

/**
 * Factory function for resolver
 * It is called only one time by Bower, to instantiate resolver.
 * You can instantiate here any caches or create helper functions.
 */
module.exports = function resolver (bower) {
  var config = bower.config.bowerSinopiaResolver || {};
  config.scopes = config.scopes || {};

  var keysToDelete = [];
  for (var key in config.scopes) {
    if (config.scopes[key].cafile) {
      config.scopes[key].ca = fs.readFileSync(
          path.resolve(config.scopes[key].cafile));
    }

    if (key !== key.toLowerCase()) {
      config.scopes[key.toLowerCase()] = config.scopes[key];
      keysToDelete.push(key);
    }
  }
  for(var i = 0; i < keysToDelete.length; i++) {
    delete config.scopes[keysToDelete[i]];
  }

  var scopeParts = /^@([-a-z]+)\//i;
  var packageNameParts = /^@[-a-z]+\/([^=]+)/i;

  function reqOptsForScope(scope) {
    var reqDefaults = {};
    if (config.scopes[scope].ca) {
      reqDefaults.ca = config.scopes[scope].ca;
    }
    return reqDefaults;
  }

  function scopeForSource(source) {
    var scopeMatches = scopeParts.exec(source);
    if(!scopeMatches) {
      return null;
    }

    return scopeMatches[1].toLowerCase();
  }

  function packageNameForSource(source) {
    var packageMatches = packageNameParts.exec(source);
    if(!packageMatches) {
      return null;
    }

    return packageMatches[1].toLowerCase();
  }

  // Resolver factory returns an instance of resolver
  return {
    // Match method tells whether resolver supports given source
    // It can return either boolean or promise of boolean
    match: function (source) {
      var scope = scopeForSource(source);
      if(!scope) {
        return false;
      }

      return scope in config.scopes;
    },

    // Allows to list available versions of given source.
    // Bower chooses matching release and passes it to "fetch"
    releases: function (source) {
      var scope = scopeForSource(source);
      var packageName = packageNameForSource(source);

      var request_ = request.defaults(reqOptsForScope(scope));
      var deferred = Q.defer();

      var packageInfoUri = config.scopes[scope].server + '/@' +
          scope + '%2f' + packageName + '/';

      request_(packageInfoUri, function(error, response, body) {
        if (error) {
          deferred.reject(new Error('Request to ' + packageInfoUri + ' failed: ' + error.message));
          return;
        }
        if (response.statusCode !== 200) {
          deferred.reject(new Error('Request to ' + packageInfoUri + ' returned ' + response.statusCode + ' status code.'));
          return;
        }

        var respObject;

        try {
          respObject = JSON.parse(body);
        } catch (e) {
          deferred.reject(e);
        }

        var versions = [];
        for(var version in respObject.versions) {
          versions.push({
            target: respObject.versions[version].dist.tarball,
            version: version
          });
        }

        deferred.resolve(versions);
      });

      return deferred.promise;
    },

    fetch: function (endpoint, cached) {
      // If cached package is semver, reuse it
      if (cached.version) {
        return;
      }

      var scope = scopeForSource(endpoint.source);

      var request_ = request.defaults(reqOptsForScope(scope));

      var downloadPath = tmp.dirSync();

      return download(endpoint.target, downloadPath.name,
          object.mixIn({ request: request_}, bower.config)).then(function (archivePatch) {
        var extractPath = tmp.dirSync();

        return extract(archivePatch, extractPath.name).then(function () {
          downloadPath.removeCallback();

          return {
            tempPath: extractPath.name,
            removeIgnores: true
          };
        });
      });
    }
  }
};
