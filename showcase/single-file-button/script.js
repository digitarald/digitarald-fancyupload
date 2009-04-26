
window.addEvent('domready', function() {

	var link = $('select-0');
	
	var linkIdle = link.get('html');

	function linkUpdate() {
		if (!swf.uploading) return;
		var rate = Swiff.Uploader.formatUnit(swf.rate, 'bps');
		var size = Swiff.Uploader.formatUnit(swf.size, 'b');
		var bytesLoaded = Swiff.Uploader.formatUnit(swf.bytesLoaded, 'b');
		
		link.set('html', swf.percentLoaded + '% <span class="small">(' + bytesLoaded + ' at ' + rate + ')</span>');
	}

	/**
	 * Uploader instance
	 */

	var swf = new Swiff.Uploader({
		path: '/3-0/source/Swiff.Uploader.swf',
		url: '../script.php',
		verbose: true,
		queued: false,
		multiple: false,
		target: link,
		instantStart: true,
		typeFilter: {
			'Images (*.jpg, *.jpeg, *.gif, *.png)': '*.jpg; *.jpeg; *.gif; *.png'
		},
		fileSizeMax: 2 * 1024 * 1024,
		onSelectSuccess: function() {
			if (Browser.Platform.linux) window.alert('Warning: Due to a misbehaviour of Adobe Flash Player on Linux,\nthe browser will probably freeze during the upload process.\nSince you are prepared now, the upload will start right away ...');
			this.setEnabled(false);
		},
		onSelectFailed: function(files) {
			alert('"' + files[0].name + '" was not added! Please select an image smaller than 2 Mb. (Error: #' + files[0].validationError + ')');
		},
		onQueue: linkUpdate,
		onFileComplete: function(file) {
			if (file.response.error) alert('The upload failed, please try again. (Error: #' + files[0].response.code + ' ' + files[0].response.error + ')');
			file.remove();
			this.setEnabled(true);
		},
		onComplete: function() {
			link.set('html', linkIdle);
		}
	});

	/**
	 * Button state
	 */
	link.addEvents({
		click: function() {
			return false;
		},
		mouseenter: function() {
			this.addClass('hover');
			swf.reposition();
		},
		mouseleave: function() {
			this.removeClass('hover');
			this.blur();
		},
		mousedown: function() {
			this.focus();
		}
	});

});
