window.addEvent('load', function() {

	var swiffy = new FancyUpload2($('demo-status'), $('demo-list'), {
		debug: true, // using console.log
		url: $('form-demo').action,
		fieldName: 'photoupload',
		path: '../../source/Swiff.Uploader.swf',
		limitSize: 2 * 1024 * 1024, // 2Mb
		target: 'demo-browse',
		onLoad: function() {
			$('demo-status').removeClass('hide');
			$('demo-fallback').destroy();
		}
	});

	/**
	 * Various interactions
	 */

	$('demo-browse').addEvent('click', function() {
		/**
		 * Doesn't work anymore with Flash 10: swiffy.browse();
		 * FancyUpload moves the Flash movie as overlay over the link.
		 */
		swiffy.browse();
		return false;
	});

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