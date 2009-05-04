/**
 * FancyUpload Showcase
 *
 * @license		MIT License
 * @author		Harald Kirschner <mail [at] digitarald [dot] de>
 * @copyright	Authors
 */

window.addEvent('domready', function() {

	var up = new FancyUpload3.Attach('demo-list', '#demo-attach, #demo-attach-2', {
		path: '../../source/Swiff.Uploader.swf',
		url: '../script.php',
		fileSizeMax: 2 * 1024 * 1024,
		
		verbose: true,
		
		onSelectFail: function(files) {
			files.each(function(file) {
				new Element('li', {
					'class': 'file-invalid',
					html: file.validationErrorMessage || file.validationError,
					events: {
						click: function() {
							this.destroy();
						}
					}
				}).inject(this.list, 'bottom');
			}, this);	
		},
		
		onFileSuccess: function(file) {
			new Element('input', {type: 'checkbox', 'checked': true}).inject(file.ui.element, 'top');
			file.ui.element.highlight('#e6efc2');
		},
		
		onFileError: function(file) {
			new Element('span', {
				html: file.errorMessage,
				'class': 'file-error'
			})
			file.ui.element.addClass('error');
		}
		
	})

	/**
	 * Uploader instance
	 */

});
