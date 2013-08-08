/**
 * MODULE FileService
 */
fs = require('fs'),
exists = fs.existsSync || path.existsSync,
path = require('path'),


FileSystemService = (function(){
	var opt;
	
	function FileSystemService(options){
		opt=options;
	}
	
	FileSystemService.prototype.scaffoldHtml = scaffoldHtml;
	FileSystemService.prototype.scaffoldSingleHtml = scaffoldSingleHtml;
	FileSystemService.prototype.filePathToUrl = filePathToUrl;
	FileSystemService.prototype.getConfig = function (url){
		try {
			file = fs.readFileSync(url,'utf-8');
			var config = JSON.parse(file);
			return config
		}catch(e){
			return '{}';
		}
	}
	
	return FileSystemService;
	
	// private functions
	function scaffoldHtml(force){
		var _testSuitFiles = lookupFiles(opt.testDir, [opt.extension])
		,testHtmlFiles = [];

		for (var i=0; i < _testSuitFiles.length; i++){
			var file = _testSuitFiles[i];
			testHtmlFiles.push(scaffoldSingleHtml(file));
		}
		return testHtmlFiles;
	}

	function scaffoldSingleHtml(file, force){
		var testHtmlFile = path.resolve(path.dirname(file)+path.sep+path.basename(file, opt.extension)+'html');

		if (force == true || !fs.existsSync(testHtmlFile)){
			var scaffoldPage = createHtmlPage(file,opt.mainDir,opt.testDir,opt.template);
			return writeFileToDisk(scaffoldPage, path.dirname(file), path.basename(file, opt.extension)+'html');
		}else {
			return path.dirname(file) +'/'+ path.basename(file, opt.extension)+'html'
		}
	}

	/**
	 * 
	 */
	function filePathToUrl(filePaths, host){
		var urls = [];
		path = require('path');
		rec(filePaths);
		function rec(filePaths){
			file = filePaths.pop();
			if (file){
				file = path.relative(process.cwd(),file);
				urls.push(file.replace(opt.testDir, host + '/test'))
				rec(filePaths);
			}
		}
		return urls
	}

	/**
	 * Lookup file names at the given `path` that match extension
	 * 
	 * @paran path [String] path to directory
	 * @param extentions [String] extension of file default spec.js
	 */
	function lookupFiles(path, extensions) {
		extensions = extensions ||  ['spec.js'];
		var pathModule = require('path')
		,join = pathModule.join
		,basename = pathModule.basename
		,stat
		,files = []
		,re = new RegExp('\\.(' + extensions.join('|') + ')$');

		if (exists(path)) {
			stat = fs.statSync(path);
			if (stat.isFile()) return path;
		}
		fs.readdirSync(path).forEach(function(file){
			file = join(path, file);
			var stat = fs.statSync(file);
			if (stat.isDirectory()) {
				files = files.concat(lookupFiles(file,extensions));
			}
			if (!stat.isFile() || !re.test(file) || basename(file)[0] == '.') return;
			files.push(file);
		});
		return files;
	}

	/**
	 * Write a string to disk syncronius 
	 * @param string String the content to be written
	 * @param ditectory String the path to the directory where the file is written
	 * @param filename String the filename of the file.
	 * @return String The full path to the file written
	 */
	function writeFileToDisk(string,directory,filename){
		var fs = require('fs');
		filePath = path.resolve(directory+path.sep,filename)
		fs.writeFileSync(filePath,string);
		return filePath;
	};

	/**
	 * Creates a requireJs driven html test page with mocka and chai (
	 * 
	 * @param files
	 *            [Array] of javascript test files to be used in this test case
	 * @param mainDir
	 *            [String] path to the root of the javascrit for the app
	 * @param mainDir
	 *            [String] path to the test root of the javascrit.
	 * @return [String] a string containing the html with html doctype
	 */
	function createHtmlPage(files,mainDir,testDir,templatePath) {
		var relToTestDir
		,relToMainDir
		,relMainToTest 
		,i
		,replacements = {}
		,ejs = require('ejs');

		if ( !(files instanceof Array) || files.length == 1){	  
			var file = files;
			var fileDir = path.dirname(file);
			replacements.relToTestDir = path.relative(fileDir,testDir)+'/';
			replacements.relToMainDir = path.relative(fileDir,mainDir)+'/';
			replacements.relTestToMain = '../' + path.relative(testDir, mainDir) + '/';	
			replacements.relMainToTest = '../' + path.relative(mainDir,testDir) + '/';	
			file = file.replace(testDir+'/','test/');
			replacements.testSuites = JSON.stringify([file.replace('.js','')]);

		}else{
			relToTestDir = '';
			relToMainDir = '../main/';
			relMainToTest = '../../test/';		
			for (i = 0 ; files.length > i ; i++){
				files[i]=files[i].replace(testDir,'');
			};
		}

		var testSuites = [];
		for (var i in files){
			testSuites.push('test/'+files[i]);
		}

		template = fs.readFileSync(path.resolve(process.cwd()+ path.sep+ templatePath),'utf-8');
		html = ejs.render(template, replacements);

		return html;
	}
	
	

})();

module.exports = FileSystemService;
