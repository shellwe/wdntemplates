// WDN must be loaded synchronously for BC and config support
requirejs.config({
	baseUrl: WDN.getTemplateFilePath('js', true),
	map: {
		"*": {
			css: 'require-css/css'
		}
	}
});

requirejs([
	// these map to used callback parameters
	'wdn',
	'require',
	// these are bundles for framework loading and plugin initialization
	'main-wdn-plugins',
	//The following plugins initialize on their own and do not need to be passed to the callback
	'plugins/skipto/skipto.min.js'
], function(WDN, require) {
	//TODO: add UNLchat
});