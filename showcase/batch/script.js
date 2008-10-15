window.addEvent('load', function() {

	/**
	 * 80% code from the original queue
	 */
	var swiffy = new FancyUpload2($('demo-status'), $('demo-list'), {
		'url': $('form-demo').action,
		'fieldName': 'upload', // change that name if u want, but also in the php
		'path': '../../source/Swiff.Uploader.swf', // change that path
		'fileCreate': function(file, options) {
			file.info = new Element('span', {'class': 'file-info'});
			file.element = new Element('li', {'class': 'file'}).adopt(
				new Element('span', {'class': 'file-size', 'html': this.sizeToKB(file.size)}),
				new Element('a', {
					'class': 'file-remove',
					'href': '#',
					'html': 'Remove',
					'events': {
						'click': function() {
							this.removeFile(file);
							return false;
						}.bind(this)
					}
				}),
				new Element('span', {'class': 'file-name', 'html': file.name}),

				/**
				 * 2 labels + span + form element thrown in ... needs some style.
				 */
				new Element('label').adopt([
					new Element('span', {'html': 'Is urgent:'}),
					new Element('input', {
						'type': 'checkbox',
						'name': 'urgent',
						'value': '1'
					})
				]),

				new Element('label').adopt([
					new Element('span', {'html': 'Your Note:'}),
					new Element('input', {
						'type': 'text',
						'name': 'note',
						'value': ''
					})
				]),

				file.info
			).inject(this.list);
		},

		/**
		 * Called when upload starts with file and default options, allows to return single options
		 * Options: data, url, fieldName, method
		 */
		'fileUpload': function(file, options) {
			/**
			 * Getting data from all form elements inside file.element (list item)
			 * Returns '' when the checkbox is not checked or the text is empty
			 */
			var inputs = file.element.getElements('input');

			options.data = {};
			for (var i = 0, j = inputs.length; i < j; i++) {
				var input = inputs[i];
				options.data[input.name] = input.get('value');
			}

			return options;
		},

		/**
		 * Called when file is uploaded with file and server response
		 */
		'fileComplete': function(file, response) {
			/**
			 * As simple example, no JSON. Only a ; separated string with result;message
			 */
			response = response.split(';'); // 0 is the result, 1 the message
			if (response[0] == 'success') {
				file.element.addClass('file-success');
				file.info.set('html', response[1]);
			} else {
				file.element.addClass('file-failed');
				file.info.set('html', response[1] || 'Unknown error'); // || for catching unknown responses without index 1
			}
		}

	});

	/**
	 * The browser button, needs also style
	 */
	$('demo-browse').addEvent('click', function() {
		swiffy.browse({'Audio (*.wav, *.vox, *.mp3)': '*.wav; *.vox; *.mp3'});
		return false;
	});

	/**
	 * Not sure if this is needed
	 */
	$('demo-clear').addEvent('click', function() {
		swiffy.removeFile();
		return false;
	});

	/**
	 * Want to style that too? Move them wherever u need them.
	 */
	$('demo-upload').addEvent('click', function() {
		swiffy.upload();
		return false;
	});

});