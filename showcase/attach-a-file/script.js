
window.addEvent('domready', function() {

	// reusing elements
	var list = $('file-list-0');
	
	var select = $('select-0');
	var selectMore = $('select-more-0');
	
	var alertStatus = function(message, cls) {
		new Element('div', {
			'class': cls,
			html: message,
			events: {
				click: function() {
					this.destroy();
				}
			}
		}).inject(selectMore, 'after');
	}

	// custom File class for individual files
	var File = new Class({

		Extends: Swiff.Uploader.File,

		initialize: function(uploader, data) {
			this.parent(uploader, data);

			this.addEvents({
				'open': this.onOpen,
				'remove': this.onRemove,
				'requeue': this.onRequeue,
				'progress': this.onProgress,
				'stop': this.onStop,
				'complete': this.onComplete
			});
		},

		render: function() {
			// More validation here
			if (this.invalid) {
				var message, sub = {
					name: this.data.file.name,
					size: Swiff.Uploader.formatUnit(this.data.file.size, 'b')
				};
				
				switch (this.data.validationError) {
					case 'duplicate':
						message = 'You can not attach "<em>{name}</em>" ({size}), it is already added!';
						sub.size_max = Swiff.Uploader.formatUnit(this.base.options.fileSizeMax, 'b');
						break;
					case 'sizeLimitMin':
						message = 'You can not attach "<em>{name}</em>" ({size}), the file size minimum is <strong>{size_min}</strong>!';
						sub.size_min = Swiff.Uploader.formatUnit(this.base.options.fileSizeMin, 'b');
						break;
					case 'sizeLimitMax':
						message = 'You can not attach "<em>{name}</em>" ({size}), the file size limit is <strong>{size_max}</strong>!';
						sub.size_max = Swiff.Uploader.formatUnit(this.base.options.fileSizeMax, 'b');
						break;
				}

				alertStatus(message.substitute(sub), 'error');
				return this;
			}
			
			this.element = new Element('li', {'class': 'file', id: 'file-' + this.id});
			this.title = new Element('span', {'class': 'file-title', text: this.data.file.name});
			this.size = new Element('span', {'class': 'file-size', text: Swiff.Uploader.formatUnit(this.data.file.size, 'b')});
			
			this.cancel = new Element('a', {'class': 'file-cancel', text: 'Cancel', href: '#'});
			this.cancel.addEvent('click', function() {
				this.remove();
				return false;
			}.bind(this));
			
			var progress = new Element('img', {'class': 'file-progress', src: '../../assets/progress-bar/bar.gif'});

			this.element.adopt(
				this.title,
				this.size,
				progress,
				this.cancel
			).inject(list).highlight();
			
			this.progress = new Fx.ProgressBar(progress, {
				fit: true
			});
			
			this.base.reposition();

			return this.parent();
		},

		onOpen: function() {
			this.element.addClass('file-running');
		},

		onRemove: function() {
			this.element.destroy();
		},

		onProgress: function() {
			this.progress.start(this.data.progress.percentLoaded);
		},

		onStop: function() {
			this.remove();
		},

		onComplete: function() {
			// clean up ;)
			this.progress = this.progress.cancel().element.destroy();
			this.cancel = this.cancel.destroy();
			
			new Element('input', {type: 'checkbox', 'checked': true}).inject(this.element, 'top');
			this.element.highlight('#e6efc2');
			
			// todo fun stuff
		}

	});

	/**
	 * Uploader instance
	 */

	var swf = new Swiff.Uploader({
		path: '/3-0/source/Swiff.Uploader.swf',
		url: '/3-0/showcase/all-inclusive/script.php',
		verbose: true,
		queued: false,
		instantStart: true,
		target: $('select-0'),
		// buttonText: 'Select A File',
		fileClass: File,
		fileSizeMax: 25 * 1024 * 1024,
		onBrowse: function() {},
		onCancel: function() {},
		onSelect: function(added, failed, data) {
			if (data.files > 0) {
				select.setStyle('display', 'none');
				selectMore.setStyle('display', 'inline');
				this.target = selectMore;
				this.reposition();
			}
		},
		onComplete: function(file, data) {
			select.setStyle('display', 'inline');
			selectMore.setStyle('display', 'none');
			this.target = select;
			this.reposition();
		}
	});
	
	/**
	 * Button state
	 */
	Elements.addEvents([select, selectMore], {
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
