/**
 * FancyUpload - Flash meets Ajax for powerful and elegant uploads.
 *
 * @version		2.1
 *
 * @license		MIT License
 *
 * @author		Harald Kirschner <mail [at] digitarald [dot] de>
 * @copyright	Authors
 */

var FancyUpload2 = new Class({

	Extends: Swiff.Uploader,

	initialize: function(status, list, options) {
		this.status = $(status);
		this.list = $(list);
		
		this.parent(options);
		this.render();
	},

	render: function() {
		this.overallTitle = this.status.getElement('.overall-title');
		this.currentTitle = this.status.getElement('.current-title');
		this.currentText = this.status.getElement('.current-text');

		var progress = this.status.getElement('.overall-progress');
		this.overallProgress = new Fx.ProgressBar(progress, {
			text: new Element('span', {'class': 'progress-text'}).inject(progress, 'after')
		});
		progress = this.status.getElement('.current-progress')
		this.currentProgress = new Fx.ProgressBar(progress, {
			text: new Element('span', {'class': 'progress-text'}).inject(progress, 'after')
		});
	},

	onSelect: function(file, index, length) {
		var errors = [];
		if (this.options.limitSize && (file.size > this.options.limitSize)) errors.push('size');
		if (this.options.limitFiles && (this.countFiles() >= this.options.limitFiles)) errors.push('length');
		if (!this.options.allowDuplicates && this.getFile(file)) errors.push('duplicate');
		if (!this.options.validateFile.call(this, file, errors)) errors.push('custom');
		if (errors.length) {
			var fn = this.options.fileInvalid;
			this.log(errors);
			if (fn) fn.call(this, file, errors);
			return false;
		}
		(this.options.fileCreate || this.fileCreate).delay(10, this, file);
		this.files.push(file);
		return true;
	},

	onAllSelect: function(files, current, overall) {
		this.log('Added ' + files.length + ' files, now we have (' + current.bytesTotal + ' bytes).', arguments);
		this.updateOverall(current.bytesTotal);
		this.status.removeClass('status-browsing');
		if (this.files.length && this.options.instantStart) this.upload.delay(10, this);
	},

	onComplete: function(file, response) {
		this.log('Completed upload "' + file.name + '".', arguments);
		this.currentText.set('html', 'Upload complete!');
		this.currentProgress.start(100);
		(this.options.fileComplete || this.fileComplete).call(this, this.finishFile(file), response);
	},

	onError: function(file, error, info) {
		this.log('Upload "' + file.name + '" failed. "{1}": "{2}".', arguments);
		(this.options.fileError || this.fileError).call(this, this.finishFile(file), error, info);
	},

	onCancel: function() {
		this.status.removeClass('file-browsing');
	},

	onAllComplete: function(current) {
		this.updateOverall(current.bytesTotal);
		this.overallProgress.start(100);
		this.status.removeClass('file-uploading');
	},

	upload: function(options) {
		var ret = this.parent(options);
		if (ret !== true) {
			this.log('Upload in progress or nothing to upload.');
			if (ret) alert(ret);
		} else {
			this.log('Upload started.');
			this.status.addClass('file-uploading');
			this.overallProgress.set(0);
		}
	},

	updateOverall: function(bytesTotal) {
		this.bytesTotal = bytesTotal;
		this.overallTitle.set('html', FancyUpload2.lang.get('progress.overall').substitute({
			total: this.sizeToKB(bytesTotal)
		}));
	}

});

FancyUpload2.lang = new Hash({
	'progress.overall': 'Overall Progress ({total})',
	'progress.file': 'File Progress "{name}"',
	'file.name': '{name}',
	'file.remove': 'Remove',
	'file.error': '<strong>{error}</strong><br />{info}'
});

FancyUpload2.File = new Class({
	
	Extends: Swiff.Uploader.File,

	initialize: function(uploader, data) {
		this.parent(uploader, data);
	},

	render: function() {

		this.addEvents({
			'open': this.onOpen,
			'remove': this.onRemove,
			'requeue': this.onRequeue,
			'progress': this.onProgress,
			'stop': this.onStop,
			'complete': this.onComplete
		});
		
		this.info = new Element('span', {'class': 'file-info'});
		this.element = new Element('li', {'class': 'file'}).adopt(
			new Element('span', {'class': 'file-size', 'html': Swiff.Uploader.formatUnit(this.size, 'b')}),
			new Element('a', {
				'class': 'file-remove',
				href: '#',
				html: FancyUpload2.lang.get('file.remove').substitute(this),
				events: {
					click: function() {
						this.remove();
						return false;
					}.bind(this)
				}
			}),
			new Element('span', {'class': 'file-name', 'html': FancyUpload2.lang.get('file.name').substitute(file)})
		).inject(this.base.list);
	},
	
	onComplete: function() {
		this.element.removeClass('file-uploading');
		
		var response = this.response.responseText || '';
		var json = $H(JSON.decode(response, true) || {});
		if (json.get('result') == 'success') {
			this.element.addClass('file-success');
			this.info.set('html', json.get('size'));
		} else {
			this.element.addClass('file-failed');
			this.info.set('html', json.get('error') || response);
		}
	},

	onError: function() {
		this.element.removeClass('file-uploading');
		
		this.element.addClass('file-failed');
		this.info.set('html', FancyUpload2.lang.get('file.error').substitute({
			file: this, error: this.response.responseCode, info: this.response.responseError
		}));
	},

	onRemove: function(file) {
		this.element.fade('out').retrieve('tween').chain(Element.destroy.bind(Element, this.element));
	},
	
});
