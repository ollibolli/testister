    var Reporter = require('./Reporter'),
	USAGE, 
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
	},
	reporterImpls = {};

USAGE = "Usage: phantomjs mocha-phantomjs.coffee REPORTER OPTIONS<json obj>"

reporterImpls.Spec = (function(_super) {

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

reporterImpls.Dot = (function(_super) {

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

reporterImpls.Tap = (function(_super) {

	__extends(Tap, _super);

	function Tap(page, url) {
		Tap.__super__.constructor.call(this, page, url,'tap');
	}

	return Tap;

})(Reporter);

reporterImpls.List = (function(_super) {

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

reporterImpls.Min = (function(_super) {

	__extends(Min, _super);

	function Min(page, url) {
		Min.__super__.constructor.call(this, page, url, 'min');
	}

	return Min;

})(Reporter);

reporterImpls.Doc = (function(_super) {

	__extends(Doc, _super);

	function Doc() {
		Doc.__super__.constructor.call(this, 'doc');
	}

	return Doc;

})(Reporter);

reporterImpls.Teamcity = (function(_super) {

	__extends(Teamcity, _super);

	function Teamcity( page, url) {
		Teamcity.__super__.constructor.call(this,  page, url,'teamcity');
	}

	return Teamcity;

})(Reporter);

reporterImpls.Xunit = (function(_super) {

	__extends(Xunit, _super);

	function Xunit( page, url) {
		Xunit.__super__.constructor.call(this, page, url, 'xunit');
	}

	return Xunit;

})(Reporter);

reporterImpls.Json = (function(_super) {

	__extends(Json, _super);

	function Json( page, url) {
		Json.__super__.constructor.call(this, page, url, 'json');
	}

	return Json;

})(Reporter);

reporterImpls.JsonCov = (function(_super) {

	__extends(JsonCov, _super);

	function JsonCov( page, url) {
		JsonCov.__super__.constructor.call(this,  page, url, 'json-cov');
	}

	return JsonCov;

})(Reporter);

reporterImpls.HtmlCov = (function(_super) {

	__extends(HtmlCov, _super);

	function HtmlCov( page, url ) {
		HtmlCov.__super__.constructor.call(this,  page, url,'html-cov');
	}

	return HtmlCov;

})(Reporter);

module.exports = reporterImpls;
