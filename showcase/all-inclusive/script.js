
window.addEvent('domready', function() {

	// reusing elements
	var list = $('file-list-0');
	var listFail = $('file-list-1');
	var dummy = list.getElement('li.file-placeholder');

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

			this.element = new Element('li', {'class': 'file', id: 'file-' + this.id});

			this.title = new Element('span', {'class': 'file-title', href: '#file-' + this.id, text: this.data.file.name});

			this.status = new Element('span', {'class': 'file-status', title: 'Status', html: 'Status'});
			this.progress = new Element('div', {'class': 'file-progress', title: 'Progress', html: 'Progress'});

			this.links = new Element('span', {'class': 'file-links'});

			if (this.invalid) {
				this.element.addClass('file-invalid');
				this.status.set('html', 'Invalid file: ' + this.data.validationError || this.validationError || 'Unknown error');

				this.title.addEvent('click', this.remove.bind(this));
			} else {
				new Element('a', {html: 'Start', href: '#'}).addEvent('click', this.start.bind(this)).inject(this.links);
				new Element('a', {html: 'Stop', href: '#'}).addEvent('click', this.stop.bind(this)).inject(this.links);
				new Element('a', {html: 'Remove', href: '#'}).addEvent('click', this.remove.bind(this)).inject(this.links);
				new Element('a', {html: 'Requeue', href: '#'}).addEvent('click', this.requeue.bind(this)).inject(this.links);

				this.element
			}

			this.element.adopt(
				this.links,
				this.title,
				this.status,
				this.progress
			).inject((this.invalid) ? listFail : list).highlight((this.invalid) ? '#f00' : null);

			return this.parent();
		},

		toggle: function() {
			if (this.data.status == Swiff.Uploader.File.STATUS_RUNNING) this.stop();
			else this.requeue();
			return false;
		},

		onOpen: function() {
			this.element.addClass('file-running');
			this.status.set('html', 'Starting');
		},

		onRemove: function() {
			this.element.destroy();
		},

		onRequeue: function() {
			this.status.set('html', 'Pending');
		},

		onProgress: function() {
			var progress = Swiff.Uploader.formatUnit(this.data.progress.rateAvg, 'bps')
				+ ' - ' + Swiff.Uploader.formatUnit(this.data.progress.bytesLoaded, 'b')
				+ ' of ' + Swiff.Uploader.formatUnit(this.data.file.size, 'b');
			var status = Swiff.Uploader.formatUnit(this.data.progress.timeRemaining, 's') + ' left';

			this.progress.set('html', progress);
			this.status.set('html', status);
		},

		onStop: function() {
			this.element.removeClass('file-running');

			this.progress.set('html', '');
			this.status.set('html', 'Stopped');
		},

		onComplete: function() {
			this.onStop();

			this.element.addClass('file-complete');

			this.status.set('text', this.data.response.text);
		}

	});


	/**
	 * Overall statictics
	 */

	var queueNodes = {
		bytesLoaded: $('queue-bytesLoaded'),
		files: $('queue-files'),
		percentLoaded: $('queue-percentLoaded'),
		rate: $('queue-rate'),
		size: $('queue-size')
	};

	var updateQueue = function(data) {
		queueNodes.files.set('html', data.files);
		queueNodes.bytesLoaded.set('html',  Swiff.Uploader.formatUnit(data.bytesLoaded, 'b'));
		queueNodes.percentLoaded.set('html', data.percentLoaded);
		queueNodes.rate.set('html', Swiff.Uploader.formatUnit(data.rate, 'bps'));
		queueNodes.size.set('html', Swiff.Uploader.formatUnit(data.size, 'b'));
	};

	/**
	 * Updating settings
	 */
	
	/* The *famous* Accordion-by-mouseover. Hidden between the lines and not enabled <8+)
	 * 
	var settings = $('settings');
	var togglers = settings.getElements('label span:index(0)');
	var magic = new Accordion(togglers, settings.getElements('label span + span'));
	
	var timer;
	
	togglers.addEvent('mouseenter', function() {
		$clear(timer);
		timer = magic.display.delay(100, magic, this.getNext());
	});
	*/

	$('option-url').addEvent('change', function() {
		swf.setOptions({url: this.value});
		this.getParent().highlight();
	});

	$('option-multiple').addEvent('change', function() {
		swf.setOptions({multiple: !!(this.checked)});
		this.getParent().highlight();
	});

	$('option-size-min').addEvent('change', function() {
		swf.setOptions({fileSizeMin: (this.value > 0) ? this.value : 0});
		this.getParent().highlight();
	});
	$('option-size-max').addEvent('change', function() {
		swf.setOptions({fileSizeMax: (this.value > 0) ? this.value : 0});
		this.getParent().highlight();
	});

	$('option-queued').addEvent('change', function() {
		swf.setOptions({queued: (this.queued > 0) ? this.value : false});
		this.getParent().highlight();
	});

	var filters = [
		null,
		'*.png',
		'*.pdf',
		{
			'Images (*.jpg, *.jpeg, *.gif, *.png)': '*.jpg; *.jpeg; *.gif; *.png',
			'Documents (*.png, *.xdoc)': '*.png; *.xdoc'
		}
	];
	$('option-filter').addEvent('change', function() {
		swf.setOptions({typeFilter: filters[this.selectedIndex]});
		this.getParent().highlight();
	});

	$('option-enable').addEvent('change', function() {
		swf.setEnabled(!!(this.checked));
		this.getParent().highlight();
	});
	

	/**
	 * Uploader instance
	 */

	var swf = new Swiff.Uploader({
		path: '/3-0/source/Swiff.Uploader.swf',
		url: $('option-url').value,
		verbose: true,
		container: $('button-select-0'),
		fileClass: File,
		buttonImage: '/3-0/assets/button_select.black.png',
		width: 149,
		height: 31,
		params: {
			wMode: 'transparent'
		},
		onLoad: function() {
			$('queue-clear-0').addEvent('click', function(){
				swf.remove();
				return false;
			});
		},
		onBrowse: function() {
			if (this.unloaded) window.cancel();
			var styles = document.getCoordinates();
			styles.lineHeight = styles.height;
			styles.visibility = 'hidden';

			/*
			this.overlay = new Element('div', {
				id: 'overlay-select',
				styles: styles,
				html: 'Selecting Files for Upload ...'
			}).inject(document.body).fade(0, 0.7);
			this.overlay = this.overlay.destroy();
			*/
		},
		onCancel: function() {
			
		},
		onSelect: function() {
			if (dummy) {
				dummy = dummy.destroy();
				$('button-start-0').removeClass('button-start-disabled');
			}
		},
		onQueue: updateQueue
	});


	$('button-start-0').addEvent('click', function(){
		if (swf.loaded) swf.start();
		return false;
	});

});
