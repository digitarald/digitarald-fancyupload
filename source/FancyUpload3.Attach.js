/**
 * FancyUpload.Attach - Flash meets Ajax for powerful and elegant uploads.
 *
 * @version		3.0 rc3
 *
 * @license		MIT License
 *
 * @author		Harald Kirschner <mail [at] digitarald [dot] de>
 * @copyright	Authors
 */

if (!window.FancyUpload3) var FancyUpload3 = {};

FancyUpload3.Attach = new Class({

	Extends: Swiff.Uploader,
	
	options: {
		queued: false,
		instantStart: true
	},

	initialize: function(list, selects, options) {
		this.list = $(list);
		this.selects = $(selects) ? $$($(selects)) : $$(selects);
				
		options.target = this.selects[0];
		options.fileClass = options.fileClass || FancyUpload3.Attach.File;
		
		this.parent(options);

		/**
		 * Button state
		 */
		var self = this;
		
		this.selects.addEvents({
			click: function() {
				return false;
			},
			mouseenter: function() {
				this.addClass('hover');
				self.reposition();
			},
			mouseleave: function() {
				this.removeClass('hover');
				this.blur();
			},
			mousedown: function() {
				this.focus();
			}
		});
		
		if (this.selects.length == 2) {
			this.selects[1].setStyle('display', 'none');
			this.addEvents({
				'selectSuccess': this.onSelectSuccess,
				'fileRemove': this.onFileRemove
			});
		}
	},
	
	onSelectSuccess: function() {
		if (this.fileList.length > 0) {
			this.selects[0].setStyle('display', 'none');
			this.selects[1].setStyle('display', 'inline');
			this.target = this.selects[1];
			this.reposition();
		}
	},
	
	onFileRemove: function() {
		if (this.fileList.length == 0) {
			this.selects[0].setStyle('display', 'inline');
			this.selects[1].setStyle('display', 'none');
			this.target = this.selects[0];
			this.reposition();
		}
	},
	
	start: function() {
		if (Browser.Platform.linux && window.confirm(MooTools.lang.get('FancyUpload', 'linuxWarning'))) return this;
		return this.parent();
	}
	
});

FancyUpload3.Attach.File = new Class({

	Extends: Swiff.Uploader.File,

	render: function() {
		
		if (this.invalid) {
			if (this.validationError) {
				var msg = MooTools.lang.get('FancyUpload', 'validationErrors')[this.validationError] || this.validationError;
				this.validationErrorMessage = msg.substitute({
					name: this.name,
					size: Swiff.Uploader.formatUnit(this.size, 'b'),
					fileSizeMin: Swiff.Uploader.formatUnit(this.base.options.fileSizeMin || 0, 'b'),
					fileSizeMax: Swiff.Uploader.formatUnit(this.base.options.fileSizeMax || 0, 'b'),
					fileListMax: this.base.options.fileListMax || 0,
					fileListSizeMax: Swiff.Uploader.formatUnit(this.base.options.fileListSizeMax || 0, 'b')
				});
			}
			this.remove();
			return;
		}
		
        this.addEvents({
            'open': this.onOpen,
            'remove': this.onRemove,
            'requeue': this.onRequeue,
            'progress': this.onProgress,
            'stop': this.onStop,
            'complete': this.onComplete,
            'error': this.onError
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
		
		this.ui.element.adopt(
			this.ui.title,
			this.ui.size,
			this.ui.cancel
		).inject(this.base.list).highlight();
		
		var progress = new Element('img', {'class': 'file-progress', src: window.theme_image_dir + 'backgrounds/progress-bar/bar.gif'}).inject(this.ui.size, 'after');
		this.ui.progress = new Fx.ProgressBar(progress, {
			fit: true
		}).set(0);
					
		this.base.reposition();

		return this.parent();
	},

	onOpen: function() {
		this.ui.element.addClass('file-uploading');
		if (this.ui.progress) this.ui.progress.set(0);
	},

	onRemove: function() {
		this.ui = this.ui.element.destroy();
	},

	onProgress: function() {
		if (this.ui.progress) this.ui.progress.start(this.progress.percentLoaded);
	},

	onStop: function() {
		this.remove();
	},
	
	onComplete: function() {
		this.ui.element.removeClass('file-uploading');

		if (this.response.error) {
			var msg = MooTools.lang.get('FancyUpload', 'errors')[this.response.error] || '{error} #{code}';
			this.errorMessage = msg.substitute($extend({name: this.name}, this.response));
			
			this.base.fireEvent('fileError', [this, this.response, this.errorMessage]);
			this.fireEvent('error', [this, this.response, this.errorMessage]);
			return;
		}
		
		if (this.ui.progress) this.ui.progress = this.ui.progress.cancel().element.destroy();
		this.ui.cancel = this.ui.cancel.destroy();
		
		var response = this.response.text || '';
		this.base.fireEvent('fileSuccess', [this, response]);
	},

	onError: function() {
		this.ui.element.addClass('file-failed');		
	}

});

//Avoiding MooTools.lang dependency
(function() {
	
	var phrases = {
		'fileName': '{name}',
		'cancel': 'Cancel',
		'cancelTitle': 'Click to cancel and remove this entry.',
		'validationErrors': {
			'duplicate': 'File <em>{name}</em> is already added, duplicates are not allowed.',
			'sizeLimitMin': 'File <em>{name}</em> (<em>{size}</em>) is too small, the minimal file size is {fileSizeMin}.',
			'sizeLimitMax': 'File <em>{name}</em> (<em>{size}</em>) is too big, the maximal file size is <em>{fileSizeMax}</em>.',
			'fileListMax': 'File <em>{name}</em> could not be added, amount of <em>{fileListMax} files</em> exceeded.',
			'fileListSizeMax': 'File <em>{name}</em> (<em>{size}</em>) is too big, overall filesize of <em>{fileListSizeMax}</em> exceeded.'
		},
		'errors': {
			'httpStatus': 'Server returned HTTP-Status #{code}',
			'securityError': 'Security error occured ({text})',
			'ioError': 'Error caused a send or load operation to fail ({text})'
		},
		'linuxWarning': 'Warning: Due to a misbehaviour of Adobe Flash Player on Linux,\nthe browser will probably freeze during the upload process.\nDo you want to start the upload anyway?'
	};
	
	if (MooTools.lang) {
		MooTools.lang.set('en-US', 'FancyUpload', phrases);
	} else {
		MooTools.lang = {
			get: function(from, key) {
				return phrases[key];
			}
		};
	}
	
})();


FancyUpload3.HTML5 = new Class({
    Implements: [Events, Options],
    options: {
        appendCookieData: false,
        data: {
            // indicate that we are using the future!
            html5: 1,
            typeFilter: null,
            fileSizeMax: null
        }
        /*
        onLoad: $empty,
        onFail: $empty,
        onStart: $empty,
        onQueue: $empty,
        onComplete: $empty,
        onBrowse: $empty,
        onDisabledBrowse: $empty,
        onCancel: $empty,
        onSelect: $empty,
        onSelectSuccess: $empty,
        onSelectFail: $empty,
        
        onButtonEnter: $empty,
        onButtonLeave: $empty,
        onButtonDown: $empty,
        onButtonDisable: $empty,
        
        onFileStart: $empty,
        onFileStop: $empty,
        onFileRequeue: $empty,
        onFileOpen: $empty,
        onFileProgress: $empty,
        onFileComplete: $empty,
        onFileRemove: $empty,
        
        onBeforeStart: $empty,
        onBeforeStop: $empty,
        onBeforeRemove: $empty
*/
    },
    eSelects: null,
    initialize: function(list, selects, oOptions)
    {
        this.setOptions(oOptions);
        this.list = list;
        selects.addEvent("change", this.onSelect.bind(this));
        if(typeOf(selects) != "elements")
        {
            selects = $$(selects);
        }
        this.eSelects = selects;
    },

    uploadProgress: function(oEvent)
    {
        var iPercentLoaded = Math.round(oEvent.loaded * 100 / oEvent.total);
        this.filedata = oEvent;
        
        if (this.ui.progress) this.ui.progress.start(iPercentLoaded);
        this.fireEvent("fileProgress", this);
    },
    uploadComplete: function(oEvent)
    {
        this.response = {
            text: oEvent.target.responseText
        };
        this.ui.element.removeClass('file-uploading');
        
        if (this.ui.progress) this.ui.progress = this.ui.progress.cancel().element.destroy();
        this.ui.cancel = this.ui.cancel.destroy();
        
        this.fireEvent("fileSuccess", this);
    },
    uploadFailed: function(oEvent)
    {
        this.ui.element.removeClass('file-uploading');
        this.fireEvent("fail", this);
    },
    uploadCanceled: function(oEvent)
    {
        this.ui.element.removeClass('file-uploading');
        
        this.fireEvent("cancel", this);
    },

    start: function() {
        var oFormData = new FormData();
        oFormData.append("Filedata", $(this.options.fileinput).files[0]);
        Object.each(this.options.data, function(mValue, mKey) {
            oFormData.append(mKey, mValue);
        });
        this.oXHR = new XMLHttpRequest();
        this.oXHR.upload.addEventListener("progress", this.uploadProgress.bind(this), false);
        this.oXHR.addEventListener("load", this.uploadComplete.bind(this), false);
        this.oXHR.addEventListener("error", this.uploadFailed.bind(this), false);
        this.oXHR.addEventListener("abort", this.uploadCanceled.bind(this), false);
        this.oXHR.open("POST", this.options.url);
        this.oXHR.send(oFormData);
        this.fireEvent("fileStart");
    },
    checkFileSize: function(oFile)
    {
        var bRetval = true;
        
        if(this.options.fileSizeMax != null && oFile.size > this.options.fileSizeMax)
        {
            bRetval = false;
            
            this.fireEvent("onSelectFail", [[{
                validationErrorMessage: "Size limit exceeded. Maximum size allowed: " + 
                    Swiff.Uploader.formatUnit(this.options.fileSizeMax, 'b')
                }]]);
        }
        
        return bRetval;
    },
    checkFileType: function(oFile)
    {
        var bRetval = true,
            strErrorTypes;
        
        if(this.options.typeFilter != null)
        {
            Object.each(this.options.typeFilter, function(strTypes, strTextTypes)
            {
                strErrorTypes = strTextTypes;
                bRetval = strTypes.split(";").some(function(strType) {
                    return oFile.name.match(
                        new RegExp("\." + strType.replace(/\s*\*\./g, '') + "$", "i")
                        );
                });
            });
        }
        
        if(!bRetval)
        {
            this.fireEvent("onSelectFail", [[{
                validationErrorMessage: "Please choose a file of type: " + strErrorTypes
                }]]);
        }
        
        return bRetval;
    },
    onSelect: function(oEvent) 
    {
        var oFile = oEvent.target.files[0];
        if (oFile) 
        {
            if(!this.checkFileSize(oFile))
            {
                oEvent.stop();
            }
            else if(!this.checkFileType(oFile))
            {
                oEvent.stop();
            }
            else
            {
                // success!
                this.options.fileinput = oEvent.target;

                this.remove();
                
                this.ui = {};
                
                this.ui.element = new Element('li', {'class': 'file'});
                this.ui.title = new Element('span', {'class': 'file-title', text: oFile.name});
                this.ui.size = new Element('span', {'class': 'file-size', text: Swiff.Uploader.formatUnit(oFile.size, 'b')});
                
                this.ui.cancel = new Element('a', {'class': 'file-cancel', text: 'Cancel', href: '#'});
                this.ui.cancel.addEvent('click', function() {
                    this.remove();
                    return false;
                }.bind(this));
                
                this.ui.element.adopt(
                    this.ui.title,
                    this.ui.size,
                    this.ui.cancel
                ).inject(this.list).highlight();
                
                var progress = new Element('img', {
                    'class': 'file-progress', 
                    src: window.theme_image_dir + 'backgrounds/progress-bar/bar.gif'
                    }).inject(this.ui.size, 'after');
                this.ui.progress = new Fx.ProgressBar(progress, {
                    fit: true
                }).set(0);
                
                this.start();
            }
        }
    },
    reset: function() 
    {
        var eNewSelects = [];
        
        this.remove();
        this.eSelects.each(function(eInput) 
        {
            // Now "reset" the input by cloning/replacing it
            // NOTE: This is pretty damn hacky
            eInputClone = eInput.clone(false,true);
            eInputClone.cloneEvents(eInput);
            eInputClone.replaces(eInput);
            eInput.destroy();
            eNewSelects[eNewSelects.length] = eInputClone;
        });
        this.eSelects = $$(eNewSelects);
        this.fireEvent("reset");
    },
    remove: function()
    {
        //if(Object.defined(this, "ui.element"))
        //{
        //   this.ui.element.destroy();
        //    this.ui = {};
        //}
        
        // Since we're only allowing one file at a time,
        // just destroy the entire list.
        this.list.empty();
        this.ui = {};
        
        this.fireEvent("remove");
    },
    reposition: function(oCoords)
    {
        // don't need to position anything.
    }

});