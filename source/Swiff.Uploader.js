/**
 * Swiff.Uploader - Flash FileReference Control
 *
 * @version		1.2
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
		multiple: true,
		queued: true,
		typeFilter: null,
		url: null,
		method: 'post',
		data: null,
		fieldName: 'Filedata',
		target: null,
		height: '100%',
		width: '100%',
		callBacks: null
	},

	initialize: function(options){
		if (Browser.Plugins.Flash.version < 9) return false;
		this.setOptions(options);

		var callBacks = this.options.callBacks || this;
		if (callBacks.onLoad) this.addEvent('onLoad', callBacks.onLoad);
		if (!callBacks.onBrowse) {
			callBacks.onBrowse = function() {
				return this.options.typeFilter;
			}
		}

		var prepare = {}, self = this;
		['onBrowse', 'onSelect', 'onAllSelect', 'onCancel', 'onBeforeOpen', 'onOpen', 'onProgress', 'onComplete', 'onError', 'onAllComplete'].each(function(index) {
			var fn = callBacks[index] || $empty;
			prepare[index] = function() {
				self.fireEvent(index, arguments, 10);
				return fn.apply(self, arguments);
			};
		});

		prepare.onLoad = this.load.create({delay: 10, bind: this});
		this.options.callBacks = prepare;

		var path = this.options.path;
		if (!path.contains('?')) path += '?noCache=' + $time(); // quick fix

		this.parent(path);

		var scroll = window.getScroll();
		this.box = new Element('div', {
			styles: {
				position: 'absolute',
				visibility: 'visible',
				zIndex: 9999,
				overflow: 'hidden',
				height: 15, width: 15,
				top: scroll.y, left: scroll.x
			}
		});
		this.inject(this.box);
		this.box.inject($(this.options.container) || document.body);

		return this;
	},

	load: function(){
		this.remote('register', this.instance, this.options.multiple, this.options.queued);
		this.fireEvent('onLoad');

		this.target = $(this.options.target);
		if (Browser.Plugins.Flash.version >= 10 && this.target) {
			this.reposition();
			window.addEvent('resize', this.reposition.bind(this));
		}
	},

	reposition: function() {
		var pos = this.target.getCoordinates(this.box.getOffsetParent());
		this.box.setStyles(pos);
	},

	/*
	Method: browse
		Open the file browser.
	*/

	browse: function(typeFilter){
		this.options.typeFilter = $pick(typeFilter, this.options.typeFilter);
		return this.remote('browse');
	},

	/*
	Method: upload
		Starts the upload of all selected files.
	*/

	upload: function(options){
		var current = this.options;
		options = $extend({data: current.data, url: current.url, method: current.method, fieldName: current.fieldName}, options);
		if ($type(options.data) == 'element') options.data = $(options.data).toQueryString();
		return this.remote('upload', options);
	},

	/*
	Method: removeFile
		For multiple uploads cancels and removes the given file from queue.

	Arguments:
		name - (string) Filename
		name - (string) Filesize in byte
	*/

	removeFile: function(file){
		if (file) file = {name: file.name, size: file.size};
		return this.remote('removeFile', file);
	},

	/*
	Method: getFileList
		Returns one Array with with arrays containing name and size of the file.

	Returns:
		(array) An array with files
	*/

	getFileList: function(){
		return this.remote('getFileList');
	}

});
