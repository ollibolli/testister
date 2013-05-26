(function() {
	var Doc, 
		Dot, 
		HtmlCov, 
		Json, 
		JsonCov, 
		List, 
		Min, 
		Reporter, 
		Spec, 
		Tap, 
		Teamcity, 
		USAGE, 
		Xunit, 
		options, 
		page, 
		reporter, 
		reporterKlass, 
		reporterString, 
		s, 
		system, 
		webpage, 
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

	
	system = require('system');
	webpage = require('webpage');
	Reporter = require('./Reporter');

	USAGE = "Usage: phantomjs mocha-phantomjs.coffee REPORTER OPTIONS<json obj>"
	Spec = (function(_super) {
	
		__extends(Spec, _super);
	
		function Spec(page, url) {
			Spec.__super__.constructor.call(this, page, url, 'spec');
		}
	
	
		Spec.prototype.customizeProcessStdout = function(options) {
			process.stdout.write = function(string) {
				if(string === process.cursor.deleteLine || string === process.cursor.beginningOfLine) {
					return;
				}
				console.log(string);
			};
		};
	
		Spec.prototype.customizeConsole = function(options) {
			var origLog;
			process.cursor.CRMatcher = /\s+◦\s\w/;
			process.cursor.CRCleaner = process.cursor.up + process.cursor.deleteLine;
			origLog = console.log;
			return console.log = function() {
				var string;
				string = console.format.apply(console, arguments);
				if(string.match(process.cursor.CRMatcher)) {
					process.cursor.CRCleanup = true;
				} else if(process.cursor.CRCleanup) {
					string = process.cursor.CRCleaner + string;
					process.cursor.CRCleanup = false;
				}
				return origLog.call(console, string);
			};
		};
		return Spec;
	
	})(Reporter);

	Dot = (function(_super) {

		__extends(Dot, _super);

		function Dot(page, url) {
			Dot.__super__.constructor.call(this, page, url, 'dot');
		}


		Dot.prototype.customizeProcessStdout = function(options) {
			process.cursor.margin = 2;
			process.cursor.CRMatcher = /\u001b\[\d\dm\․\u001b\[0m/;
			process.stdout.columns = options.columns;
			process.stdout.allowedFirstNewLine = false;
			
			process.stdout.write = function(string) {
				var forward;
				if(string === '\n  ') {
					if(!process.stdout.allowedFirstNewLine) {
						process.stdout.allowedFirstNewLine = true;
					} else {
						return;
					}
				} else if(string.match(process.cursor.CRMatcher)) {
					if(process.cursor.count === process.stdout.columns) {
						process.cursor.count = 0;
						forward = process.cursor.margin;
						string = process.cursor.forwardN(forward) + string;
					} else {
						forward = process.cursor.margin + process.cursor.count;
						string = process.cursor.up + process.cursor.forwardN(forward) + string;
					}++process.cursor.count;
				}
				return console.log(string);
			};
		};
		return Dot;

	})(Reporter);
	Tap = (function(_super) {

		__extends(Tap, _super);

		function Tap(page, url) {
			Tap.__super__.constructor.call(this, page, url,'tap');
		}

		return Tap;

	})(Reporter);
	
	List = (function(_super) {

		__extends(List, _super);

		function List(page, url) {
			List.__super__.constructor.call(this, page, url, 'list');
		}


		List.prototype.customizeProcessStdout = function(options) {
			process.stdout.write = function(string) {
				if(string === process.cursor.deleteLine || string === process.cursor.beginningOfLine) {
					return;
				}
			 	console.log(string);
			};
		};

		List.prototype.customizeProcessStdout = function(options) {
			var origLog;
			process.cursor.CRMatcher = /\u001b\[90m.*:\s\u001b\[0m/;
			process.cursor.CRCleaner = function(string) {
				return process.cursor.up + process.cursor.deleteLine + string + process.cursor.up + process.cursor.up;
			};
			origLog = console.log;
			return console.log = function() {
				var string;
				string = console.format.apply(console, arguments);
				if(string.match(/\u001b\[32m\s\s-\u001b\[0m/)) {
					string = string;
					process.cursor.CRCleanup = false;
				}
				if(string.match(process.cursor.CRMatcher)) {
					process.cursor.CRCleanup = true;
				} else if(process.cursor.CRCleanup) {
					string = process.cursor.CRCleaner(string);
					process.cursor.CRCleanup = false;
				}
				return origLog.call(console, string);
			};
		};
		return List;

	})(Reporter);
	Min = (function(_super) {

		__extends(Min, _super);

		function Min(page, url) {
			Min.__super__.constructor.call(this, page, url, 'min');
		}

		return Min;

	})(Reporter);
	Doc = (function(_super) {

		__extends(Doc, _super);

		function Doc() {
			Doc.__super__.constructor.call(this, 'doc');
		}

		return Doc;

	})(Reporter);
	
	Teamcity = (function(_super) {

		__extends(Teamcity, _super);

		function Teamcity( page, url) {
			Teamcity.__super__.constructor.call(this,  page, url,'teamcity');
		}

		return Teamcity;

	})(Reporter);
	Xunit = (function(_super) {

		__extends(Xunit, _super);

		function Xunit( page, url) {
			Xunit.__super__.constructor.call(this, page, url, 'xunit');
		}

		return Xunit;

	})(Reporter);
	Json = (function(_super) {

		__extends(Json, _super);

		function Json( page, url) {
			Json.__super__.constructor.call(this, page, url, 'json');
		}

		return Json;

	})(Reporter);
	JsonCov = (function(_super) {

		__extends(JsonCov, _super);

		function JsonCov( page, url) {
			JsonCov.__super__.constructor.call(this,  page, url, 'json-cov');
		}

		return JsonCov;

	})(Reporter);
	HtmlCov = (function(_super) {

		__extends(HtmlCov, _super);

		function HtmlCov( page, url ) {
			HtmlCov.__super__.constructor.call(this,  page, url,'html-cov');
		}

		return HtmlCov;

	})(Reporter);
	
	
	// Start logic
	
	// handel input 
	reporterString = system.args[1] || 'spec';
	options = JSON.parse(system.args[2]);
	
	reporterString = ((function() {
		var _i, _len, _ref, _results;
		_ref = reporterString.split('-');
		_results = [];
		for( _i = 0, _len = _ref.length; _i < _len; _i++) {
			s = _ref[_i];
			_results.push("" + (s.charAt(0).toUpperCase()) + (s.slice(1)));
		}
		return _results;
	})()).join('');
		
	ReporterKlass = (function() {
		try {
			return eval(reporterString);
		} catch (error) {
			console.error("END HERE 22222", error);
			return
			void 0;
		}
	})();

//  make all work
	
	if(ReporterKlass) {
		var fs = require('fs');
		var logFile = fs.open(fs.workingDirectory+'/'+options.logDir+'/test-log.txt','w');
		var errorFile = fs.open(fs.workingDirectory+'/'+options.logDir+'/test-errors.txt','w');

		page = webpage.create();
		var urls = options.urls
		var statistics = {
			testSuits : 0,
			failures : 0,
			total : 0
		}
		
		recursive(urls , 0);
		function recursive(urls, i) {
			var url = urls.pop();
			// no more test to run exit phantom
			reporter = new ReporterKlass(page, url);
			var logoutput = '';
			
			/*override*/
			reporter.onConsoleMessage = function(msg){
				console.log(msg);
				msg+="\n";
				logoutput += msg;
			};
			
			/*override*/
			reporter.onFinish = function(result){
				statistics.testSuits += 1;
				statistics.failures += result.failures; 
				console.log("failiurea" , result.failures);
				if (result.runner && result.runner.total){
					statistics.total += result.runner.total || 0; 		
				}
				if (result.failures){
					errorFile.write(logoutput);
					errorFile.flush();
				}
				logFile.write(logoutput);
				logFile.flush();

				if (urls.length <= 0 ){
					reporter.log('### ALL TEST DONE ###');
					reporter.log(statistics);
					page.close();
					logFile.close();
					errorFile.close();
					if (statistics.failures = 0){
						phantom.exit(0);
					}else {
						phantom.exit(1);
					}
				}
				recursive(urls, i);
			}
			
			reporter.run();
		}
		
	} else {
		console.log("Reporter class not implemented: " + reporterString);
		phantom.exit(1);
	}

}).call(this);
