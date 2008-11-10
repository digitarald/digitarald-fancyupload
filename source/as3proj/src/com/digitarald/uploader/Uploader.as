package com.digitarald.uploader
{
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.display.MovieClip;
	import flash.events.*;
	import flash.utils.*;
	import com.adobe.serialization.json.*;
		
	/*
	 * From fancyupload imports:
	 */ 
	import flash.external.*;
	import flash.net.FileReferenceList;
	import flash.net.FileReference;
	import flash.net.FileFilter;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	
	/**
	 * @licence		MIT Licence
	 * 
	 * @author		Anders Rasmussen <aras@dr.dk>
	 * @author		Harald Kirschner <http://digitarald.de>
	 * @author		Valerio Proietti, <http://mad4milk.net>
	 * @copyright	Authors
	 */
	public class Uploader extends Sprite 
	{
		
		public function Uploader():void 
		{
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e:Event = null):void 
		{
			removeEventListener(Event.ADDED_TO_STAGE, init);
			
			
			// ExternalInterface callback adding copied:
			ExternalInterface.addCallback('register', register);
			ExternalInterface.addCallback('browse', browse);
			ExternalInterface.addCallback('upload', upload);
			ExternalInterface.addCallback('removeFile', removeFile);
			ExternalInterface.addCallback('getFileList', getFileList);
			
			/*
			 * Make the stage clickable and transparent.
			 */
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.addEventListener(MouseEvent.CLICK, stageClicked);
			
			var bg:MovieClip = new MovieClip();
			bg.graphics.beginFill(0xFF0000, 0);
			bg.graphics.drawRect(0, 0, 1024, 1024);
			bg.x = 0;
			bg.y = 0;
			bg.width = 1024;
			bg.height = 1024;
			bg.graphics.endFill();
			bg.buttonMode = true;
			bg.useHandCursor = true;
			addChild(bg);

			ExternalInterface.call(root.loaderInfo.parameters.onLoad);
			
		}
		private function stageClicked(e:MouseEvent):void {
			browse();
		}
		
		/*
		 * Below here:
		 * Copied from fancyupload 
		 * 
		 */
		
		private var allowed:Boolean = true;
		private var timer:Number = 0;
		
		private var multiple:Boolean = true;
		private var queued:Boolean = true;
		private var options:Object = new Object();
		private var fileList:Array = new Array();
		private var fileProgress:Array = new Array();
		private var progress:Object = new Object();
		
		private var fileReference:Object = null;
		private var uploading:Boolean = false;

		private function allow():void{
			allowed = true;
			timer = 0;
		}

		private function register(index:String, multiple:Boolean, queued:Boolean):void{
			this.multiple = (multiple == true);
			this.queued = (this.multiple && queued == true);
			this.progress = {
				filesFinished: 0,
				filesTotal: 0,
				bytesFinished: 0,
				bytesLoaded: 0,
				bytesTotal: 0
			};
		}

		private function selectHandler(event:Event):void {
			var ref:* = (multiple) ? FileReferenceList(event.target) : FileReference(event.target);
			var added:Array = new Array();
			if (multiple) {
				for (var i:Number = 0; i < ref.fileList.length; i++){
					var file:FileReference = ref.fileList[i];
					if ((indexOfFile(file) === -1) && ExternalInterface.call(root.loaderInfo.parameters.onSelect, valueOfFile(file), i, ref.fileList.length) !== false){
						addEvents(file);
						added.push(file);
					}
				}
			} else if (ExternalInterface.call(root.loaderInfo.parameters.onSelect, valueOfFile(ref as FileReference)) !== false) {
				if (fileList.length) {
					removeFile();
				}
				added.push(ref);
			}
			added = added.map(function(file:*):* {
				fileList.push(file);
				fileProgress.push(false);
				progress.bytesTotal += file.size;
				progress.filesTotal++;
				return valueOfFile(file);
			});
			fileReference = null;
			ExternalInterface.call(root.loaderInfo.parameters.onAllSelect, added, updateProgress());
		}

		private function updateProgress():Object {
			var progress:Object = progress;
			progress.rate = 0;
			progress.bytesLoaded = progress.bytesFinished;
			for (var i:int = 0; i < this.fileProgress.length; i++){
				var fileProgress:Object = this.fileProgress[i];
				if (!fileProgress) continue;
				progress.bytesLoaded += fileProgress.bytesLoaded;
				progress.rate += fileProgress.rate;
			}
			progress.percentLoaded = Math.round((progress.bytesLoaded / progress.bytesTotal) * 100);
			progress.timeLeft = Math.round((progress.bytesTotal - progress.bytesLoaded) / progress.rate);
			return progress;
		};

		private function cancelHandler(event:Event):void {
			this.fileReference = null;
			ExternalInterface.call(root.loaderInfo.parameters.onCancel);
		}

		private function openHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			var fileProgress:Object = this.fileProgress[this.fileList.indexOf(file)];
			fileProgress.started = fileProgress.updated = (new Date()).getTime();
			ExternalInterface.call(root.loaderInfo.parameters.onOpen, valueOfFile(file), this.progress);
		}

		private function progressHandler(event:ProgressEvent):void {
			if (!allowed) return;
			allowed = false;
			var file:FileReference = FileReference(event.target);

			var fileProgress:Object = this.fileProgress[this.fileList.indexOf(file)];
			var time:Number = (new Date()).getTime();
			fileProgress.rate = 0;

			if (event.bytesLoaded){
				var len:Number = fileProgress.graph.unshift(Math.round((event.bytesLoaded - fileProgress.bytesLoaded) / (time - fileProgress.updated)));
				if (len > 10) len = --fileProgress.graph.length;
				for (var i:int = 0; i < len; i++) fileProgress.rate += fileProgress.graph[i];
				fileProgress.rate = Math.round(fileProgress.rate / len) * 1000;
				fileProgress.percentLoaded = Math.round((fileProgress.bytesLoaded / fileProgress.bytesTotal) * 100);
				fileProgress.timeLeft = Math.round((fileProgress.bytesTotal - fileProgress.bytesLoaded) / fileProgress.rate);
				fileProgress.bytesLoaded = event.bytesLoaded;
			} else {
				fileProgress.started = time;
			}
			fileProgress.updated = time;

			updateProgress();

			ExternalInterface.call(root.loaderInfo.parameters.onProgress, valueOfFile(file), fileProgress, updateProgress());
			if (!timer) timer = setTimeout(allow, 200);
		}

		private function completeHandler(event:DataEvent):void {
			var file:FileReference = FileReference(event.target);
			finishFile(file);
			ExternalInterface.call(root.loaderInfo.parameters.onComplete, valueOfFile(file), event.data, updateProgress());
			checkQueue();
		}

		private function httpStatusHandler(event:HTTPStatusEvent):void {
			var file:FileReference = FileReference(event.target);
			if (finishFile(file)){
				ExternalInterface.call(root.loaderInfo.parameters.onError, valueOfFile(file), 'httpStatus', event.status, updateProgress());
				checkQueue();
			}
		}

		private function ioErrorHandler(event:IOErrorEvent):void {
			var file:FileReference = FileReference(event.target);
			if (finishFile(file)){
				ExternalInterface.call(root.loaderInfo.parameters.onError, valueOfFile(file), 'ioError', event.text, updateProgress());
				checkQueue();
			}
		}

		private function securityErrorHandler(event:SecurityErrorEvent):void {
			var file:FileReference = FileReference(event.target);
			if (finishFile(file)){
				ExternalInterface.call(root.loaderInfo.parameters.onError, valueOfFile(file), 'securityError', event.text, updateProgress());
				checkQueue();
			}
		}

		private function checkQueue():void {
			if (this.queued && this.fileList.length){
				upload();
			} else {
				if (this.multiple) ExternalInterface.call(root.loaderInfo.parameters.onAllComplete, updateProgress());
				this.progress.bytesTotal = this.progress.filesTotal = this.progress.bytesFinished = this.progress.filesFinished = 0;
			}
		}

		private function addEvents(ref:Object):void {
			ref.addEventListener(Event.CANCEL, cancelHandler);
			ref.addEventListener(Event.SELECT, selectHandler);
			ref.addEventListener(Event.OPEN, openHandler);
			ref.addEventListener(ProgressEvent.PROGRESS, progressHandler);
			ref.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, completeHandler);
			ref.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			ref.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			ref.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
		}

//----------------------------------------------------------------------------------------------------------//

		private function browse():Object {
			if (this.fileReference) return false;
			
			var typeFilter:Object = ExternalInterface.call(root.loaderInfo.parameters.onBrowse);
			var filter:Array = new Array();
			if (typeFilter){
				for (var key:String in typeFilter){
					var type:FileFilter = new FileFilter(key, typeFilter[key]);
					filter.push(type);
				}
			}
			
			this.fileReference = (this.multiple) ? new FileReferenceList() : new FileReference();
			addEvents(this.fileReference);
			try {
				if (this.fileReference.browse(filter)) return true;
			} catch (e:Error) {
				this.fileReference = null;
				return e.name;
			}
			this.fileReference = null;
			return 'Error';
		};

		private function upload(options:Object = null):Object {
			if (this.uploading || !this.fileList.length) {
				return false;
			}
			if (options) this.options = options;
			this.uploading = true;
			try {
				if (this.queued){
					uploadFile(this.fileList[0]);
				} else {
					for (var i:Number = 0; i < this.fileList.length; i++){
						uploadFile(this.fileList[i]);
					}
				}
			} catch (e:Error) {
				return e.name;
			}
			return true;
		};

		private function getFileList():Array {
			return this.fileList.map(function(file:FileReference):Object {
				return valueOfFile(file);
			});
		};

		private function removeFile(file:Object = null, finished:Boolean = false):Boolean {
			if (file){
				var num:Number = indexOfFile(file);
				if (num == -1) return false;
				this.fileList[num].cancel();
				this.fileList.splice(num, 1);
				this.fileProgress.splice(num, 1);
				if (finished){
					this.progress.bytesFinished += file.size;
					this.progress.filesFinished++;
				} else {
					this.progress.bytesTotal -= file.size;
					this.progress.filesTotal--;
				}
			} else {
				if (!this.fileList.length) return false;
				for (var i:int = 0; i < this.fileList.length; i++) this.fileList[i].cancel();
				this.fileList.length = this.fileProgress.length = 0;
				if (finished){
					this.progress.bytesFinished = this.progress.bytesTotal;
					this.progress.filesFinished = this.progress.filesTotal;
				} else {
					this.progress.bytesTotal = this.progress.filesTotal = this.progress.bytesFinished = this.progress.filesFinished = 0;
				}
			}
			if (!this.fileList.length) this.uploading = false;
			return true;
		};

		// Helper

		private function indexOfFile(file:Object):Number {
			var list:Array = this.fileList;
			for (var i:Number = 0; i < list.length; i++){
				if ((list[i].name == file.name) && (list[i].size == file.size)) return i;
			}
			return -1;
		};

		private function valueOfFile(file:FileReference):Object {
			return {
				name: file.name,
				size: file.size,
				type: file.type,
				creationDate: file.creationDate.valueOf(),
				modificationDate: file.modificationDate.valueOf()
			};
		}

		private function uploadFile(file:FileReference):void {
			var optionsDefault:Object = (this.options) ? this.options : new Object();
			var optionsOverride:Object = ExternalInterface.call(root.loaderInfo.parameters.onBeforeOpen, valueOfFile(file), optionsDefault);
			var options:Object = (optionsOverride) ? optionsOverride : optionsDefault;

			options.fieldName = (options.fieldName) ? options.fieldName : 'Filedata';
			var urlRequest:URLRequest = new URLRequest((options.hasOwnProperty('url')) ? options.url : '');
			if (options.hasOwnProperty('data')){
				var data:URLVariables = new URLVariables();
				if (options.data is String) data.decode(options.data);
				else for (var key:Object in options.data) data[key] = options.data[key];
				urlRequest.data = data;
			}
			urlRequest.method = URLRequestMethod[(options.method) ? options.method.toUpperCase() : 'POST'];
			this.fileProgress[this.fileList.indexOf(file)] = {graph: [], bytesLoaded: 0, percentLoaded: 0, bytesTotal: file.size, timeLeft: null, options: options};
			file.upload(urlRequest, options.fieldName);
		}

		private function finishFile(file:FileReference):Boolean {
			var removeFiled:Boolean = removeFile(file, true);
			if (removeFiled) this.uploading = false;
			return removeFiled;
		};
		 
		 
		 /*
		  * Above here:
		  * Copied from fancyupload
		  * 
		  */	
	}
}