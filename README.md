FancyUpload - Swiff meets Ajax
========================

**[Swiff](http://www.adobe.com/products/flashplayer/)** meets **Ajax** for powerful and elegant uploads.
FancyUpload is a file-input replacement which features an unobtrusive, multiple-file selection
menu and queued upload with an animated progress bar. It is easy to setup, is server independent,
completely styleable via CSS and XHTML and uses [MooTools][] to work in all modern browsers.

### Keywords: {#keywords}

- MooTools
- FancyUpload
- Fileinput
- Uploader
- Swiff
- FileReference
- ExternalInterface

Build (cr. [@cpojer](http://github.com/cpojer))
-----------------------------------------------

Build via [Packager](http://github.com/kamicane/packager), requires [MooTools Core](http://github.com/mootools/mootools-core) and [MooTools Class-Extras](http://github.com/cpojer/mootools-class-extras) to be registered to Packager already

	packager register /path/to/FancyUploader
	packager build FancyUploader/* > fancy-uploader.js

To build this plugin without external dependencies use

	packager build FancyUploader/* +use-only FancyUploader > FancyUploader.js
