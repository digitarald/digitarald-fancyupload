Previous Version {#big-important-note}
-------------------

If you missed the link above, the previous FancyUpload for [MooTools 1.11](http://mootools.net) is still [available](/project/fancyupload/1-0/) including example code and minor updates.

Features {#features}
-------------------

* Select and upload multiple files
* Filter files by type in the select dialog
* Optional Events to add your own behaviour
* Show and filter useful file information before the upload starts
* Limit uploads by file count and/or file size
* Platform and *server independent*, just needs Flash 9+ (> 95% penetration)
* Unobtrusive, since the element is replaced after the swf loaded successfully
* Cancel running uploads, add files during upload
* Everything is optional, documented and easy editable
* New in 2.0
  * Get the server response after upload for showing additional informations or previewing the image, etc.
  * Shows the current upload speed and the time left
  * Send additional request data via GET or POST variables
  * Set the filename for the upload request
* New in 2.1
	* **Works in Flash 10** by adding a clickable overlay


Compatibility {#compatibility}
-------------------

Fully compatible with all [A-Grade Browsers][] ([Internet Explorer 6+](http://www.microsoft.com/windows/products/winfamily/ie/default.mspx),
[Opera 9](http://www.opera.com/), [Firefox 1.5+](http://www.mozilla.com/en-US/firefox/) and [Safari 3+](http://www.apple.com/safari/))
with [Adobe Flash 9 and 10](http://www.adobe.com/products/flashplayer/) player.

How to use {#how-to}
-------------------

Will be written for the final release, at this time the showcases are the best documentation.

Tips, Tricks and Quirks {#faq}
-------------------

How do I access the uploaded files?

:	Every upload, even with multiple files, results in one request. Access the uploaded file via

	- PHP: $_FILES['Filedata']
	- Perl: $main::cgi->param('Filedata'); ... [example](http://forum.mootools.net/viewtopic.php?id=2726#post-14326)
	- Rails: params[:Filedata] ... [example](http://forum.mootools.net/viewtopic.php?id=2726&p=6#post-22330)
	- ASP: [Fancy Upload and Classic ASP](http://bennewton.us/2007/07/22/fancy-upload-and-classic-asp/)
	
	*Filedata* is the default value for the option fieldName, so you can change it. The submitted content-type is always "application/octet-stream", so don't trust it when you validate the file.

Flash-request forgets cookies and session ID

:	Flash FileReference is not an intelligent upload class, the request will not have the browser cookies, Flash saves his own cookies. When you have sessions, append them as get-data to the the URL (e.g. "upload.php?SESSID=123456789abcdef"). Of course your session-name can be different.

Are cross-domain uploads possible?

:	[Forum solution](http://forum.mootools.net/viewtopic.php?id=8312), and FileReference docs:

	> For uploading and downloading operations, a SWF file can access files only within its own domain, including any domains that are specified by a cross-domain policy file. If the SWF that is initiating the upload or download doesn't come from the same domain as the file server, you must put a policy file on the file server.
	[More on security and link to cross-domain policies](http://livedocs.adobe.com/flash/8/main/wwhelp/wwhimpl/common/html/wwhelp.htm?context=LiveDocs_Parts&file=00001590.html)

FancyUpload does not load, the input element gets not replaced

:	Check in [Firebug](http://www.getfirebug.com/) in *Net/Flash* that the SWF file loads correctly. If not double check your given options.

Uploads fail with 404 error code

:	Check your URL and better *use an absolute upload URL*.
	
	IE takes the upload url *relative* to the swf, all other browsers relative to the html/current file. So the best solution is an absolute path for the option url or rather the form action. *If you have problems with failed upload and 404 error codes, try an absolute url*, in your form-action or url option when creating your FancyUpload instance.

Uploads fail with 406/403 error

:	From the swfupload documentation:
	
	> If you are using Apache with mod_security this will not work, you need to put the following in your .htaccess file to disable mod_security:
	> 
	> 	SecFilterEngine Off
	> 	SecFilterScanPOST Off
	>
	> Disabling mod_security isn't allowed on some shared hosts, and only do this if you know what you are doing.
	> This is due to a bug in the way that flash sends the headers back to the server according to the Flash 8 documentation

Uploads fail with 403/500 error

:	Check your server config, there must be something wrong. Also see 404, double check the upload URL.

Uploads and Basic Authentication

:	Flash does not care about authenticated Browsers. Firefix/Win/Flash 9 can handle it, IE too, Mac can't handle it.
	Anyways, Flash will ask for its own access username and password.

Requirements {#requirements}
-------------------

*It does not depend on any server-side architecture or language.*

### MooTools JavaScript Framework 1.2

[__Download MooTools 1.2__](http://mootools.net/core).

- Element.Events
- Fx.Tween
- Fx.Transitions 
- Selectors
- Json
- Swiff
- _DomReady (facultative)_

**Don't use compressed code during development to simplify debugging.**

Download {#download}
-------------------

* [FancyUpload2.js](source/FancyUpload2.js)
* [Swiff.Uploader.js](source/Swiff.Uploader.js)
* [Fx.ProgressBar.js](source/Fx.ProgressBar.js "Will get his own project page later")
* [Swiff.Uploader.swf](source/Swiff.Uploader.swf "It is a hidden, 1px movie and only contains ActionScript!") (*Use right-click/save-as!*)
* Complete ActionScript/JavaScript source, documentation and showcases are available at [github](http://github.com/): [digitarald-fancyupload repository](https://github.com/digitarald/digitarald-fancyupload)
	* The [images](http://github.com/digitarald/digitarald-fancyupload/tree/master/assets) from the [showcases](/project/fancyupload/2-0/showcase/photoqueue/) are also [downloadable](http://github.com/digitarald/digitarald-fancyupload/tree/master/assets).

References {#references}
-------------------

- [MooTools Forum](http://forum.mootools.net): ["Fancy Upload by digitarald"](http://forum.mootools.net/viewtopic.php?id=2726) with 15 pages
- [Jason: Flash Upload Progress for Rails with FancyUpload for mootools](http://edseek.com/archives/2007/07/15/flash-upload-progress-for-rails-with-fancyupload-for-mootools/)
- [FileReference (flash.net.FileReference) - Version 9](http://livedocs.adobe.com/flash/9.0/ActionScriptLangRefV3/flash/net/FileReference.html)
- [Ben Newton: Fancy Upload and Classic ASP](http://bennewton.us/2007/07/22/fancy-upload-and-classic-asp/)
