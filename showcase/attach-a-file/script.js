
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
		},

		render: function() {
			
			if (this.invalid) {
				var message = 'Unknown Error', sub = {
					name: this.name,
					size: Swiff.Uploader.formatUnit(this.size, 'b')
				};
				
				switch (this.validationError) {
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
			
			this.addEvents({
				'open': this.onOpen,
				'remove': this.onRemove,
				'requeue': this.onRequeue,
				'progress': this.onProgress,
				'stop': this.onStop,
				'complete': this.onComplete
			});
			
			this.ui = {};
			
			this.ui.element = new Element('li', {'class': 'file', id: 'file-' + this.id});
			this.ui.title = new Element('span', {'class': 'file-title', text: this.name});
			this.ui.size = new Element('span', {'class': 'file-size', text: Swiff.Uploader.formatUnit(this.size, 'b')});
			
			this.ui.cancel = new Element('a', {'class': 'file-cancel', text: 'Cancel', href: '#'});
			this.ui.cancel.addEvent('click', function() {
				this.remove();
				return false;
			}.bind(this));
			
			var progress = new Element('img', {'class': 'file-progress', src: '../../assets/progress-bar/bar.gif'});

			this.ui.element.adopt(
				this.ui.title,
				this.ui.size,
				progress,
				this.ui.cancel
			).inject(list).highlight();
			
			this.ui.progress = new Fx.ProgressBar(progress, {
				fit: true
			}).set(0);
						
			this.base.reposition();

			return this.parent();
		},

		onOpen: function() {
			this.ui.element.addClass('file-running');
		},

		onRemove: function() {
			this.ui = this.ui.element.destroy();
		},

		onProgress: function() {
			this.ui.progress.start(this.progress.percentLoaded);
		},

		onStop: function() {
			this.remove();
		},

		onComplete: function() {
			// clean up ;)
			this.ui.progress = this.ui.progress.cancel().element.destroy();
			this.ui.cancel = this.ui.cancel.destroy();
			
			new Element('input', {type: 'checkbox', 'checked': true}).inject(this.ui.element, 'top');
			this.ui.element.highlight('#e6efc2');
			
			// todo fun stuff
		}

	});

	/**
	 * Uploader instance
	 */

	var swf = new Swiff.Uploader({
		path: '/3-0/source/Swiff.Uploader.swf',
		url: '../script.php',
		verbose: true,
		queued: false,
		target: $('select-0'),
		// buttonText: 'Select A File',
		instantStart: true,
		fileClass: File,
		fileSizeMax: 25 * 1024 * 1024,
		onBrowse: function() {},
		onCancel: function() {},
		onSelectSuccess: function() {
			if (this.fileList.length > 0) {
				select.setStyle('display', 'none');
				selectMore.setStyle('display', 'inline');
				this.target = selectMore;
				this.reposition();
			}
			if (Browser.Platform.linux) window.alert('Warning: Due to a misbehaviour of Adobe Flash Player on Linux,\nthe browser will probably freeze during the upload process.\nSince you are prepared now, the upload will start right away ...');
		},
		onFileRemove: function() {
			if (this.fileList.length == 0) {
				select.setStyle('display', 'inline');
				selectMore.setStyle('display', 'none');
				this.target = select;
				this.reposition();
			}
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
