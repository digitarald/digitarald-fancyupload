/**
 * Swiff.Uploader - Flash FileReference Control
 *
 * @version		1.3
 *
 * @license		MIT License
 *
 * @author		Harald Kirschner <mail [at] digitarald [dot] de>
 * @copyright	Authors
 */

Swiff.Uploader = new Class({

	Extends: Swiff,

	Implements: Events,

	options: {
		path: 'Swiff.Uploader.swf',
		id: 'SwiffUploader',
		target: null,
		height: 22,
		width: 61,
		callBacks: null,
		params: {
			wMode: 'opaque',
			menu: 'false',
			allowScriptAccess: 'always'
		},

		typeFilter: null,
		multiple: true,
		queued: true,
		verbose: false,

		url: null,
		method: null,
		data: null,
		mergeData: true,
		fieldName: null,

		fileSizeMin: 1,
		fileSizeMax: null, // Official limit is 100 MB for FileReference!
		allowDuplicates: false,

		buttonText: null,
		buttonTextStyle: null,
		buttonTextPaddingTop: 0,
		buttonTextPaddingLeft: 0,
		buttonImage: null,

		instantStart: false,
		sendCookies: false,
		fileClass: null

	},

	initialize: function(options) {
		if (Browser.Plugins.Flash.version < 9) return false;

		window.addEvent('beforeunload', function() {
			this.unloaded = true;
		}.bind(this));

		this.addEvents({
			'load': this.onLoad,
			'select': this.onSelect,
			'complete': this.onQueue
		});

		this.setOptions(options);

		if (this.options.callBacks) {
			Hash.each(this.options.callBacks, function(fn, name) {
				this.addEvent(name, fn);
			}, this);
		}

		this.options.callBacks = {
			fireCallback: this.fireCallback.bind(this)
		};

		var path = this.options.path;
		if (!path.contains('?')) path += '?noCache=' + $time(); // quick fix

		this.options.container = this.box = new Element('span', {'class': 'swiff-uploader-box'}).inject($(this.options.container) || document.body);

		this.target = $(this.options.target);
		if (this.target) {
			var scroll = window.getScroll();
			this.box.setStyles({
				position: 'absolute',
				visibility: 'visible',
				zIndex: 9999,
				overflow: 'hidden',
				height: 1, width: 1,
				top: scroll.y, left: scroll.x
			});
			
			this.parent(path, {
				params: {
					wMode: 'transparent'
				},
				height: '100%',
				width: '100%'
			});
			
			this.addEvents({
				buttonEnter: this.targetRelay.bind(this, ['mouseenter']),
				buttonLeave: this.targetRelay.bind(this, ['mouseleave']),
				buttonDown: this.targetRelay.bind(this, ['mousedown']),
				buttonDisable: this.targetRelay.bind(this, ['disable'])
			});
			
			this.reposition();
			window.addEvent('resize', this.reposition.bind(this));
		} else {
			this.parent(path);
		}

		this.inject(this.box);

		this.fileList = [];
		return this;
	},

	update: function(data) {
		this.data = data;
		this.fireEvent('queue', [this.data], 10);
		return this;
	},

	fireCallback: function(name, args) {
		this.fireEvent(name, args, 10);
		if (name.substr(0, 4) == 'file') {
			if (args.length > 1) this.update(args[1]);
			var data = args[0];
			var file = this.findFile(data.id);
			if (!file) return;
			var fire = name.replace(/^file([A-Z])/, function($0, $1) {
				return $1.toLowerCase();
			});
			file.update(data).fireEvent(fire, [data], 10);
		}
	},

	findFile: function(id) {
		for (var i = 0; i < this.fileList.length; i++) {
			if (this.fileList[i].id == id) return this.fileList[i];
		}
		return null;
	},

	onLoad: function() {
		this.remote('initialize', {
			width: this.options.width,
			height: this.options.height,
			typeFilter: this.options.typeFilter,
			multiple: this.options.multiple,
			queued: this.options.queued,
			url: this.options.url,
			method: this.options.method,
			data: this.options.data,
			mergeData: this.options.mergeData,
			fieldName: this.options.fieldName,
			verbose: this.options.verbose,

			fileSizeMin: this.options.fileSizeMin,
			fileSizeMax: this.options.fileSizeMax,
			allowDuplicates: this.options.allowDuplicates,
			
			buttonText: this.options.buttonText,
			buttonTextStyle: this.options.buttonTextStyle,
			buttonTextPaddingTop: this.options.buttonTextPaddingTop,
			buttonTextPaddingLeft: this.options.buttonTextPaddingLeft,
			buttonImage: this.options.buttonImage
		});

		this.loaded = true;

		this.sendCookies();
	},
	
	targetRelay: function(name) {
		if (this.target) this.target.fireEvent(name);
	},

	reposition: function() {
		var pos = this.target.getCoordinates(this.box.getOffsetParent());
		this.box.setStyles(pos);
	},

	setOptions: function(options) {
		this.parent(options);
		if (this.loaded) this.remote('setOptions', options);
	},

	setEnabled: function(status) {
		this.remote('setEnabled', status);
	},

	start: function() {
		this.remote('start');
	},

	stop: function() {
		this.remote('stop');
	},

	remove: function() {
		this.remote('remove');
	},

	fileStart: function(file) {
		this.remote('fileStart', file.data.id);
	},

	fileStop: function(file) {
		this.remote('fileStop', file.data.id);
	},

	fileRemove: function(file) {
		this.remote('fileRemove', file.data.id);
	},

	fileRequeue: function(file) {
		this.remote('fileRequeue', file.data.id);
	},

	sendCookies: function() {
		var send = this.options.sendCookies;
		if (!send) return;
		var hash = {};
		document.cookie.split(/;\s*/).each(function(cookie) {
			cookie = cookie.split('=');
			if (cookie.length < 2) return;
			hash[decodeURIComponent(cookie[0])] = decodeURIComponent(cookie[1] || '');
		});

		var data = this.options.data || {};
		if ($type(send) == 'string') data[send] = hash;
		else $extend(data, send);

		this.setOptions({data: data});
	},

	onSelect: function(successraw, failedraw, queueData) {
		var cls = this.options.fileClass || Swiff.Uploader.File;

		var failed = [], success = [];

		if (successraw) {
			successraw.each(function(data) {
				var ret = new cls(this, data);
				if (!ret.validate()) {
					failed.push(ret);
					return;
				}
				success.push(ret.render());
			}, this);
			this.fileList.extend(success);

			this.fireEvent('onSelectSuccess', [success]);
		}

		if (failedraw || failed.length) {
			failed.extend((failedraw) ? failedraw.map(function(data) {
				return new cls(this, data);
			}, this) : []).each(function(file) {
				file.invalidate().render();
			});

			this.fireEvent('onSelectFailed', [failed]);
		}

		this.fireEvent('queue', [queueData]);

		if (this.options.instantStart && success.length) this.start();
	}

});

$extend(Swiff.Uploader, {

	STATUS_QUEUED: 0,
	STATUS_RUNNING: 1,
	STATUS_ERROR: 2,
	STATUS_COMPLETE: 3,
	STATUS_STOPPED: 4,

	log: function() {
		if (window.console) console.info.apply(console, arguments);
	},

	unitLabels: {
		b: [{min: 1, unit: 'B'}, {min: 1024, unit: 'kB'}, {min: 1048576, unit: 'MB'}, {min: 1073741824, unit: 'GB'}],
		s: [{min: 1, unit: 's'}, {min: 60, unit: 'm'}, {min: 3600, unit: 'h'}, {min: 86400, unit: 'd'}]
	},

	formatUnit: function(base, type, join) {
		var labels = Swiff.Uploader.unitLabels[(type == 'bps') ? 'b' : type];
		var append = (type == 'bps') ? '/s' : '';
		var i, l = labels.length, value;

		if (base < 1) return '0 ' + labels[0].unit + append;

		if (type == 's') {
			var units = [];

			for (i = l - 1; i >= 0; i--) {
				value = Math.floor(base / labels[i].min);
				if (value) {
					units.push(value + ' ' + labels[i].unit);
					base -= value * labels[i].min;
					if (!base) break;
				}
			}

			return (join === false) ? units : units.join(join || ', ');
		}

		for (i = l - 1; i >= 0; i--) {
			value = labels[i].min;
			if (base >= value) break;
		}

		return (base / value).toFixed(1) + ' ' + labels[i].unit + append;
	}

});

Swiff.Uploader.File = new Class({

	Implements: Events,

	initialize: function(base, data) {
		this.base = base;
		this.id = data.id;
		this.update(data);

		this.addEvents({
			'onFileRemove': this.onFileRemove
		});
	},

	update: function(data) {
		this.data = data;
		return this;
	},

	validate: function() {
		return true;
	},

	invalidate: function() {
		this.invalid = true;
		return this.fireEvent('invalid');
	},

	render: function() {
		return this;
	},

	setOptions: function(options) {
		this.base.remote('fileSetOptions', this.id, options);
		this.data.options = $merge(this.data.options, options);
	},

	start: function() {
		this.base.fileStart(this);
	},

	stop: function() {
		this.base.fileStop(this);
	},

	remove: function() {
		this.base.fileRemove(this);
	},

	requeue: function() {
		this.base.fileRequeue(this);
	},

	onFileRemove: function() {
		this.base.fileList.erase(this);
	}

});
