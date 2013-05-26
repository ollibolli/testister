(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = Array.prototype.slice;

  +({
    define: typeof define === 'function' ? define : function(F) {
      return F(require, exports, module);
    }
  }).define(function(require, exports, module) {
    var IsolationContext, IsolationFactory, build_dependencies, getMatcherForPath, getType, passthru;
    getType = function(o) {
      return Object.prototype.toString.call(o);
    };
    passthru = function(actual) {
      return actual;
    };
    getMatcherForPath = function(path) {
      var path_type;
      path_type = getType(path);
      if (path_type === '[object RegExp]') {
        return path;
      } else if (path_type === '[object String]') {
        if (path[0] + path.slice(-1) === '//') {
          return new RegExp(path.slice(1, -2));
        } else {
          return new RegExp("(^|[^a-zA-Z0-9_])" + path + "$");
        }
      }
      throw Error("Expected either a String or RegExp, but got " + (getType(path)));
    };
    build_dependencies = function(dependencies) {
      dependencies.find = function(val) {
        var matching_dependencies, mod, path, regex;
        regex = getMatcherForPath(val);
        matching_dependencies = [];
        for (path in dependencies) {
          if (!__hasProp.call(dependencies, path)) continue;
          mod = dependencies[path];
          if (0 === path.indexOf('isolate!')) continue;
          if (regex.test(path)) matching_dependencies.push(path);
        }
        if (matching_dependencies.length > 1) {
          throw Error("Ambiguous call to find dependency: '" + val + "' matched: [" + matching_dependencies + "]");
        }
        return dependencies[matching_dependencies[0]];
      };
      return dependencies;
    };
    IsolationFactory = (function() {

      function IsolationFactory(factory) {
        this.factory = factory;
      }

      return IsolationFactory;

    })();
    IsolationContext = (function() {

      function IsolationContext() {
        this.mapAsFactory = __bind(this.mapAsFactory, this);
        this.reset = __bind(this.reset, this);
        this.willRequire = __bind(this.willRequire, this);
        this.mapType = __bind(this.mapType, this);
        this.map = __bind(this.map, this);
        this.passthru = __bind(this.passthru, this);
        this.useRequire = __bind(this.useRequire, this);
        this.load = __bind(this.load, this);
        this.isolate = __bind(this.isolate, this);
        this.findMatchingHandler = __bind(this.findMatchingHandler, this);
        this.processDependency = __bind(this.processDependency, this);        this.rules = [];
        this.typeHandlers = {};
        Object.getPrototypeOf(module).isolate = this.isolate;
      }

      IsolationContext.prototype.processDependency = function(path, actual, parent_module_path) {
        var handler;
        handler = this.findMatchingHandler(path, actual);
        if (handler == null) {
          throw Error("Failed to generate fake for module [" + path + "] of type [" + (getType(actual)) + "] while isolating module [" + parent_module_path + "]");
        }
        return handler(actual, path, parent_module_path);
      };

      IsolationContext.prototype.findMatchingHandler = function(path, actual) {
        var rule, _i, _len, _ref;
        _ref = this.rules;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          rule = _ref[_i];
          if (rule.matcher.test(path)) return rule.handler;
        }
        return this.typeHandlers[getType(actual).toLowerCase()];
      };

      IsolationContext.prototype.isolate = function(requested_module, context) {
        var actual, dependencies, full_module_path, handler, isolatedModule, path, urlForException, _i, _len, _ref, _ref2, _ref3;
        context = context || this;
        full_module_path = module.constructor._resolveFilename(requested_module, context)[0];
        module.constructor._cache = {};
        try {
          require(full_module_path);
        } catch (err) {
          urlForException = "https://github.com/tnwinc/Isolate/wiki/Error:-An-error-occurred-while-preparing-to-isolate-the-module";
          err.message = "An error occurred while preparing to isolate the module: " + requested_module + "\nFor more information, see " + urlForException + "\nInner Exception:\n" + err.message;
          throw err;
        }
        delete module.constructor._cache[full_module_path];
        dependencies = {};
        _ref = module.constructor._cache;
        for (path in _ref) {
          if (!__hasProp.call(_ref, path)) continue;
          actual = _ref[path];
          actual.exports = dependencies[path] = this.processDependency(path, actual.exports, full_module_path);
          actual.exports.actual = actual;
        }
        isolatedModule = require(full_module_path);
        isolatedModule.dependencies = build_dependencies(dependencies);
        module.constructor._cache = {};
        if ((_ref2 = this.isolateCompleteHandlers) != null ? _ref2.length : void 0) {
          _ref3 = this.isolateCompleteHandlers;
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            handler = _ref3[_i];
            handler(isolatedModule);
          }
        }
        return isolatedModule;
      };

      IsolationContext.prototype.load = function(requested_module, req, load, config) {
        var isolatedContextName, isolatedCtx, isolatedRequire, mainCtx, modulesToLoad, urlForException,
          _this = this;
        this.require || (this.require = require);
        mainCtx = this.require.s.contexts['_'];
        isolatedContextName = "isolated_" + (Math.floor(Math.random() * 100000));
        isolatedRequire = this.require.config({
          context: isolatedContextName,
          baseUrl: mainCtx.config.baseUrl
        });
        isolatedCtx = this.require.s.contexts[isolatedContextName];
        modulesToLoad = [requested_module].concat(this.ensuredAsyncModules || []);
        try {
          return req(modulesToLoad, function(mod) {
            var key, modName, modVal, _i, _j, _len, _len2, _ref, _ref2, _ref3;
            _ref = isolatedCtx.defined;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              key = _ref[_i];
              delete isolatedCtx.defined[key];
            }
            _ref2 = isolatedCtx.loaded;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              key = _ref2[_j];
              delete isolatedCtx.loaded[key];
            }
            _ref3 = mainCtx.defined;
            for (modName in _ref3) {
              if (!__hasProp.call(_ref3, modName)) continue;
              modVal = _ref3[modName];
              if (modName === requested_module) continue;
              if (modName !== 'isolate') {
                isolatedCtx.defined[modName] = _this.processDependency(modName, modVal, requested_module);
              }
              isolatedCtx.loaded[modName] = true;
            }
            delete isolatedCtx.defined[requested_module];
            delete isolatedCtx.loaded[requested_module];
            return isolatedRequire([requested_module], function(isolatedModule) {
              var handler, key, _k, _l, _len3, _len4, _len5, _m, _ref4, _ref5, _ref6, _ref7;
              if (isolatedModule == null) {
                throw Error("The requested module " + requested_module + " was not found.");
              }
              isolatedModule.dependencies = build_dependencies(isolatedCtx.defined);
              _ref4 = mainCtx.defined;
              for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
                key = _ref4[_k];
                delete mainCtx.defined[key];
              }
              _ref5 = mainCtx.loaded;
              for (_l = 0, _len4 = _ref5.length; _l < _len4; _l++) {
                key = _ref5[_l];
                delete mainCtx.loaded[key];
              }
              if ((_ref6 = _this.isolateCompleteHandlers) != null ? _ref6.length : void 0) {
                _ref7 = _this.isolateCompleteHandlers;
                for (_m = 0, _len5 = _ref7.length; _m < _len5; _m++) {
                  handler = _ref7[_m];
                  handler(isolatedModule);
                }
              }
              return load(isolatedModule);
            });
          });
        } catch (err) {
          urlForException = "https://github.com/tnwinc/Isolate/wiki/Error:-An-error-occurred-while-preparing-to-isolate-the-module";
          err.message = "An error occurred while preparing to isolate the module: " + requested_module + "\nFor more information, see " + urlForException + "\nInner Exception:\n" + err.message;
          throw err;
        }
      };

      IsolationContext.prototype.useRequire = function(require) {
        this.require = require;
        return this;
      };

      IsolationContext.prototype.passthru = function() {
        var path, paths, _i, _len;
        paths = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if ('[object Array]' === getType(paths[0])) paths = paths[0];
        for (_i = 0, _len = paths.length; _i < _len; _i++) {
          path = paths[_i];
          this.rules.unshift({
            matcher: getMatcherForPath(path),
            handler: passthru
          });
        }
        return this;
      };

      IsolationContext.prototype.map = function() {
        var args, handler, path, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (getType(args[0]) === '[object Object]') {
          _ref = args[0];
          for (path in _ref) {
            if (!__hasProp.call(_ref, path)) continue;
            handler = _ref[path];
            this.map(path, handler);
          }
        } else {
          path = args[0];
          handler = args[1];
          this.rules.unshift({
            matcher: getMatcherForPath(path),
            handler: handler instanceof IsolationFactory ? handler.factory : function() {
              return handler;
            }
          });
        }
        return this;
      };

      IsolationContext.prototype.mapType = function() {
        var args, handler, type, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (getType(args[0]) === '[object Object]') {
          _ref = args[0];
          for (type in _ref) {
            if (!__hasProp.call(_ref, type)) continue;
            handler = _ref[type];
            this.mapType(type, handler);
          }
        } else {
          type = "[object " + (args[0].toLowerCase()) + "]";
          handler = args[1];
          this.typeHandlers[type] = handler instanceof IsolationFactory ? handler.factory : function() {
            return handler;
          };
        }
        return this;
      };

      IsolationContext.prototype.willRequire = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this.ensuredAsyncModules || (this.ensuredAsyncModules = []);
        (_ref = this.ensuredAsyncModules).push.apply(_ref, args);
        return this;
      };

      IsolationContext.prototype.reset = function() {
        this.rules.length = 0;
        this.typeHandlers = {};
        return this;
      };

      IsolationContext.prototype.mapAsFactory = function() {
        var args, factory, path, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length === 1) {
          if ('[object Function]' === getType(args[0])) {
            return new IsolationFactory(args[0]);
          } else {
            _ref = args[0];
            for (path in _ref) {
              if (!__hasProp.call(_ref, path)) continue;
              factory = _ref[path];
              this.mapAsFactory(path, factory);
            }
          }
        } else {
          path = args[0];
          factory = args[1];
          this.rules.unshift({
            matcher: getMatcherForPath(path),
            handler: factory
          });
        }
        return this;
      };

      IsolationContext.prototype.isolateComplete = function(handler) {
        (this.isolateCompleteHandlers = this.isolateCompleteHandlers || []).push(handler);
        return this;
      };

      return IsolationContext;

    })();
    return module.exports = new IsolationContext;
  });

}).call(this);
