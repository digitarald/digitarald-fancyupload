/**
 * FancyUpload Showcase
 *
 * @license		MIT License
 * @author		Harald Kirschner <mail [at] digitarald [dot] de>
 * @copyright	Authors
 */

window.addEvent('domready', function() {

	var up = new FancyUpload2($('demo-status'), $('demo-list'), {
		url: $('form-demo').action,
		path: '../../source/Swiff.Uploader.swf',
		// remove that line to select all files, or edit it, add more items
		typeFilter: {
			'Images (*.jpg, *.jpeg, *.gif, *.png)': '*.jpg; *.jpeg; *.gif; *.png'
		},
		verbose: true,
		target: 'demo-browse',
		onLoad: function() {
			$('demo-status').removeClass('hide');
			$('demo-fallback').destroy();
			
			this.target.addEvents({
				click: function() {
					return false;
				},
				mouseenter: function() {
					this.addClass('hover');
				},
				mouseleave: function() {
					this.removeClass('hover');
					this.blur();
				},
				mousedown: function() {
					this.focus();
				}
			});

			// Interactions for the 2 buttons
			
			$('demo-clear').addEvent('click', function() {
				up.remove();
				return false;
			});

			$('demo-upload').addEvent('click', function() {
				up.start();
				return false;
			});
		},
		
		// edit the following lines, it is your custom event handling
		onSelectFail: function(files) {
			if (!files.length) return;
			files.each(function(file) {
				new Element('li', {
					'class': 'validation-error',
					html: file.validationErrorMessage || file.validationError,
					title: MooTools.lang.get('FancyUpload', 'removeTitle'),
					events: {
						click: function() {
							this.destroy();
						}
					}
				}).inject(this.list, 'top');
			}, this);
		},
		
		onFileSuccess: function(file, response) {
			var json = $H(JSON.decode(response, true) || {});
			
			if (json.get('status') == '1') {
				file.element.addClass('file-success');
				file.info.set('html', json.get('width') + ' x ' + json.get('height') + 'px ' + json.get('mime'));
			} else {
				file.element.addClass('file-failed');
				file.info.set('html', json.get('error') || response);
			}
		},
		
		onFail: function(error) {
			switch (error) {
				case 'flash': // huge fail, bail out
					alert('To enable the embedded uploader, install the latest Adobe Flash plugin.');
					break;
				case 'hidden': // works after enabling the movie and clicking refresh
					alert('To enable the embedded uploader, unblock it in your browser and refresh (see Adblock).');
					break;
				case 'blocked': // This no *full* fail, it works after the user clicks the button
					alert('To enable the embedded uploader, enable the blocked Flash movie (see Flashblock).');
					break;
			}
			
		}
		
	});
	
});