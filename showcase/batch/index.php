<?php
	$append = http_build_query(array(
		session_name()	=> session_id(),
		'batch_id'		=> md5(uniqid(rand(), true))
	), null, '&amp;');

	/**
	 * Flash forgets the session_id, so we provide it in the URL.
	 * We also create a unique batch_id to keep track of the batch upload.
	 */
?>
<form action="/project/fancyupload/2-0/showcase/batch/script.php?<?= $append ?>" method="post" enctype="multipart/form-data" id="form-demo">

	<div id="demo-status">
		<p>
			<a href="#" id="demo-browse">Browse Files</a> |
			<a href="#" id="demo-clear">Clear List</a> |
			<a href="#" id="demo-upload">Upload</a>
		</p>
		<div>
			<strong class="overall-title">Overall progress</strong><br />
			<img src="../../assets/progress-bar/bar.gif" class="progress overall-progress" />
		</div>
		<div>
			<strong class="current-title">File Progress</strong><br />
			<img src="../../assets/progress-bar/bar.gif" class="progress current-progress" />
		</div>
		<div class="current-text"></div>
	</div>

	<ul id="demo-list"></ul>

</form>