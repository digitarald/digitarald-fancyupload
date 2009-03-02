window.addEvent('domready', function() {

	// For testing, showing the user the current Flash version.
	document.getElement('#demo-status p').appendText(' | Flash ' + Browser.Plugins.Flash.version + '!');

	var swiffy = new FancyUpload2($('demo-status'), $('demo-list'), {
		url: $('form-demo').action,
		fieldName: 'photoupload',
		path: '../../source/Swiff.Uploader.swf',
		limitSize: 2 * 1024 * 1024, // 2Mb
		onLoad: function() {
			$('demo-status').removeClass('hide');
			$('demo-fallback').destroy();
		},
		//fileInvalid: function(file, errors) {
		//	alert(errors.join(' '));
		//},
		// The changed parts!
		debug: true, // enable logs, uses console.log
		target: 'demo-browse' // the element for the overlay (Flash 10 only)
	});

	/**
	 * Various interactions
	 */

	$('demo-browse').addEvent('click', function() {
		/**
		 * Doesn't work anymore with Flash 10: swiffy.browse();
		 * FancyUpload moves the Flash movie as overlay over the link.
		 * (see opeion "target" above)
		 */
		swiffy.browse();
		return false;
	});

	/**
	 * The *NEW* way to set the typeFilter, since Flash 10 does not call
	 * swiffy.browse(), we need to change the type manually before the browse-click.
	 */
	$('demo-select-images').addEvent('change', function() {
		var filter = null;
		if (this.checked) {
			filter = {'Images (*.jpg, *.jpeg, *.gif, *.png)': '*.jpg; *.jpeg; *.gif; *.png'};
		}
		swiffy.options.typeFilter = filter;
	});

	$('demo-clear').addEvent('click', function() {
		swiffy.removeFile();
		return false;
	});

	$('demo-upload').addEvent('click', function() {
		swiffy.upload();
		return false;
	});

});

function onLoad() {
console.log('Called', arguments);
	return 'true';
}