<?php

/**
 * Session init, this should be somewhere in your library
 */
session_name('SID');
session_start();


/**
 * Default result
 */
$result = array(
	'result'	=> 'error'
);

if (isset($_FILES['upload']) && isset($_GET['batch_id']) )
{
	$file = $_FILES['upload']['tmp_name'];
	$error = false;
	$size = false;

	/**
	 * Add more validation here
	 */
	if (!is_uploaded_file($file) || ($_FILES['photoupload']['size'] > 10 * 1024 * 1024) )
	{
		$error = 'Please upload only files smaller than 10Mb!';
	}
	/**
	 * More validation: mime type, etc ...
	 */

	if ($error)
	{
		$result['message'] = $error;
	}
	else
	{
		$batch_id = $_GET['batch_id'];

		/**
		 * Multiple batches, count the files
		 */
		if (!isset($_SESSION['upload_batches']) )
		{
			$_SESSION['upload_batches'] = array();
		}
		if (!isset($_SESSION['upload_batches'][$batch_id]) )
		{
			$_SESSION['upload_batches'][$batch_id] = 0;
		}
		$_SESSION['upload_batches'][$batch_id]++;

		$position = $_SESSION['upload_batches'][$batch_id];


		$file_name = $_FILES['upload']['name'];

		$urgent = '0';
		if (isset($_POST['urgent']) && $_POST['urgent'] == '1')
		{
			$urgent = '1';
		}

		$note = '';
		if (isset($_POST['note']) && strlen($_POST['note']) )
		{
			$note = $_POST['note'];
		}

		$folder = dirname(__FILE__) . '/uploads/';

		/**
		 * Update the batch
		 */
		$fp = fopen($folder . $_GET['batch_id']. '.ini', 'a');
		fwrite($fp, "[VoiceFile #$position]
Filename: $file_name
Stat: $urgent
Note: $note
BatchCode: $batch_id

");
		fclose($fp);

		/**
		 * Move the File, new name is batch_id-position, extension is not stripped
		 */
		move_uploaded_file($file, $folder . $batch_id . $position);

		$result['result'] = 'success';
		$result['message'] = 'File #' . $position . ' uploaded successfully.';
	}
}
else
{
	$result['message'] = 'Missing file or internal error!';
}

echo implode(';', $result);

?>