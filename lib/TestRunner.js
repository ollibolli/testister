
/**
 * Creates a testrunner that run a single html file at a time.
 */
function TestRunner(testSuiteUrls, opt){

	var fs = require('fs'),
        print = require('util').print,
        spawn = require('child_process').spawn,
        self = this,
		result = true,
		logFile,
		errorFile;

	this.run = function (){
		var output= ""
			,buffer = "";// new Buffer(output);
		runTestSuit(opt.script, testSuiteUrls, opt.reporter);

		// the test is finish create result
		function runTestSuit(script, pages, reporter ){

			var config = JSON.stringify({
				timeout: opt.timeout,
				cookies: [],
				headers: {},
				settings: {},
				logDir: opt.logDir,
				urls: pages
				// viewportSize: program.view,
				// useColors: program.color
			});
			var spawnArgs = [script, reporter, config];

			var phantomjs;
			for (var i=0; i < module.paths.length; i++) {
				var bin = path.join(module.paths[i], '.bin/phantomjs');
				if (process.platform === 'win32') {
					bin += '.cmd';
				}
				if (exists(bin)) {
					phantomjs = spawn(bin, spawnArgs);
					break;
				}
			}
			if (phantomjs === undefined) {
				phantomjs = spawn('phantomjs', spawnArgs);
			}

			phantomjs.stdout.on('data', function(data){
				print(data);
			});

			phantomjs.stderr.on('data', function(data){
				print("ERROR" + data);
			});

			phantomjs.on('error', function(error){
				print('ERROR : Testrunner onError ', error)
			});

			phantomjs.on('exit', function(code){
				if (code != 0){
					result = false;
				}

				if (result){
					process.exit(0);
				}else {
					process.exit(1);
				}
			});
		}
	}
}
module.exports = TestRunner;
