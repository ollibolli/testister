var system = require('system'), 
	webpage = require('webpage'), 
	reporterImpls = require('./reporterImpls'), 
	USAGE = "Usage: phantomjs mocha-phantomjs.coffee REPORTER OPTIONS<json obj>";

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

ReporterKlass = reporterImpls[reporterString];

//  make all work

if(ReporterKlass) {
	var fs = require('fs');
	var logFile = fs.open(fs.workingDirectory + '/' + options.logDir + '/test-log.txt', 'w');
	var errorFile = fs.open(fs.workingDirectory + '/' + options.logDir + '/test-errors.txt', 'w');
	page = webpage.create();
	var urls = options.urls;
	var statistics = {
		testSuits : 0,
		failures : 0,
		total : 0
	}

	recursive(urls, 0 );
	function recursive(urls, i, reporter) {
		var url = urls.pop();
		// no more test to run exit phantom
		reporter = new ReporterKlass(page, url);
		var logoutput = '';

		/*override*/
		reporter.onConsoleMessage = function(msg) {
			console.log(msg);
			msg += "\n";
			logoutput += msg;
		};
		/*override*/
		reporter.onFinish = function(result) {
			statistics.testSuits += 1;
			statistics.failures += result.failures;
			if(result.runner && result.runner.total) {
				statistics.total += result.runner.total || 0;
			}
			if(result.failures) {
				errorFile.write(logoutput);
				errorFile.flush();
			}
			logFile.write(logoutput);
			logFile.flush();

			if(urls.length <= 0) {
				reporter.log('### ALL TEST DONE ###');
				reporter.log('Results:');
				reporter.log('\tNumber of TestSuits: ' + statistics.testSuits);
				reporter.log('\tFailed tests: ' + statistics.failures);
				reporter.log('\tTotal amount of tests: ' + statistics.total);
				page.close();
				logFile.close();
				errorFile.close();
				if(statistics.failures = 0) {
					phantom.exit(0);
				} else {
					phantom.exit(1);
				}
			}
			recursive(urls, i);
		}

		reporter.run();
	}

} else {
	console.log("Reporter class not implemented: " + reporterString);
	console.log(JSON.stringify(reporterImpls, 1));
	phantom.exit(1);
}