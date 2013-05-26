var	system = require('system'),
	__bind = function(fn, me) {
		return function() {
			return fn.apply(me, arguments);
		};
	},
	__hasProp = {}.hasOwnProperty, 

	__extends = function(child, parent) {
		for(var key in parent) {
			if(__hasProp.call(parent, key))
				child[key] = parent[key];
		}
		function ctor() {
			this.constructor = child;
		}	

		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		child.__super__ = parent.prototype;
		return child;
	};


Reporter = (function() {

	function Reporter(page, url, reporter) {
		this.page = page;
		this.url = url;
		this.reporter = reporter;
		this.waitForRunMocha = __bind(this.waitForRunMocha, this);

		this.waitForMocha = __bind(this.waitForMocha, this);

		this.columns = parseInt(system.env.COLUMNS || 75) * .75 | 0;
		this.mochaStarted = false;
		this.mochaStartWait = 6000;
		if(!this.url) {
			this.fail(USAGE);
		}
		if(!this.page) {
			this.fail(USAGE + "Missing page");
		}
	}


	Reporter.prototype.run = function() {
		this.initPage();
		return this.loadPage();
	};

	Reporter.prototype.customizeRunner = function(options) {
		return
		void 0;
	};

	Reporter.prototype.customizeProcessStdout = function(options) {
		return
		void 0;
	};

	Reporter.prototype.customizeConsole = function(options) {
		return
		void 0;
	};

	Reporter.prototype.customizeOptions = function() {
		return {
			columns : this.columns
		};
	};

	Reporter.prototype.fail = function(msg) {
		if(msg) {
			this.log(msg);
		}
		this.finish(1);

	};

	Reporter.prototype.finish = function(code) {
		mochaPhantomJS = this.page.evaluate(function() {
			return mochaPhantomJS;
		});
		if (code >= 1){
			mochaPhantomJS.failures += 1;
		}
		this.onFinish(mochaPhantomJS);
	};
	
	/**
	 * This is the default finish behaivior alter if needed
	 */
	Reporter.prototype.onFinish = function(exitcode){
		phantom.exit(exitcode);
	};

	Reporter.prototype.log = function(msg){
		//Use the page customized log
		this.page.evaluate(function(msg){
			console.log(msg);
		},msg );
	};
	
	Reporter.prototype.error = function(msg){
		//Use the page customized log
		this.page.evaluate(function(msg){
			console.error(msg);
		},msg );
	};
	
	Reporter.prototype.onConsoleMessage = function(msg, lineNum, sourceId) {
		this.log(msg);
	};

	Reporter.prototype.onError = function(msg, lineNum, sourceId) {
		this.log(msg.join('\n'));
	};

	Reporter.prototype.initPage = function() {
		var _this = this;
		this.page = this.page || webpage.create();
		this.page.onConsoleMessage = _this.onConsoleMessage;
					
		this.page.onInitialized = function() {
			return _this.page.evaluate(function() {
				window.mochaPhantomJS = {
					failures : 0,
					ended : false,
					started : false,
					run : function() {
						mochaPhantomJS.started = true;
						window.callPhantom('mochaPhantomJS.run');
					}
				};
			});
		};
		this.page.onError = function(msg, trace) {
 			var msgStack = ["PHANTOM ERROR: " + msg];
			if (trace && trace.length) {
    			msgStack.push('TRACE:');
    			trace.forEach(function(t) {
       				msgStack.push("at " + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    			});
			}			
			_this.fail(msgStack.join('\n'));
		};
		
		return this.page.onResourceReceived = function(response) {
		};
	};

	Reporter.prototype.loadPage = function() {
		var _this = this;
		this.page.open(this.url);
		this.page.onLoadFinished = function(status) {
			if(status !== 'success') {
				_this.onLoadFailed();
			} 
			_this.log("Test Case  - " + _this.url);

		};
		return this.page.onCallback = function(data) {
			if(data === 'mochaPhantomJS.run') {
				if(_this.injectJS()) {
					return _this.waitForRunMocha();
				}
			}
		};
	};

	Reporter.prototype.onLoadFailed = function() {
		this.fail("Failed to load the page. Check the url: " + this.url);
	};


	Reporter.prototype.injectJS = function() {
		if(this.page.evaluate(function() {
			return window.mocha != null;
		})) {
			this.page.injectJs('core_extensions.js');
			this.page.evaluate(this.customizeProcessStdout, this.customizeOptions());
			this.page.evaluate(this.customizeConsole, this.customizeOptions());
			return true;
		} else {
			this.fail("Failed to find mocha on the page.");
			return false;
		}
	};

	Reporter.prototype.runMocha = function() {
		this.page.evaluate(this.runner, this.reporter);
		this.mochaStarted = this.page.evaluate(function() {
			return mochaPhantomJS.runner || false;
		});
		if(this.mochaStarted) {
			this.mochaRunAt = new Date().getTime();
			this.page.evaluate(this.customizeRunner, this.customizeOptions());
			return this.waitForMocha();
		} else {
			return this.fail("Failed to start mocha.");
		}
	};

	Reporter.prototype.waitForMocha = function() {
		var ended;
		ended = this.page.evaluate(function() {
			return mochaPhantomJS.ended;
		});
		if(ended) {
			return this.finish();
		} else {
			return setTimeout(this.waitForMocha, 100);
		}
	};

	Reporter.prototype.waitForRunMocha = function() {
		var started;
		started = this.page.evaluate(function() {
			return mochaPhantomJS.started;
		});
		if(started) {
			return this.runMocha();
		} else {
			return setTimeout(this.waitForRunMocha, 100);
		}
	};

	Reporter.prototype.runner = function(reporter) {
		try {
			mocha.setup({
				reporter : reporter
			});
			mochaPhantomJS.runner = mocha.run();
			if(mochaPhantomJS.runner) {
				mochaPhantomJS.runner.on('end', function() {
					mochaPhantomJS.failures = this.failures;
					mochaPhantomJS.ended = true;
				});
			}
		} catch (error) {
			console.error("END HERE?????");
			this.finish();
			return false;
		}
	};
	return Reporter;

})();

module.exports = Reporter;