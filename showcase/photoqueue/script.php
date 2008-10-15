<?php

$result = array();

if (isset($_FILES['photoupload']) )
{
	$file = $_FILES['photoupload']['tmp_name'];
	$error = false;
	$size = false;

	if (!is_uploaded_file($file) || ($_FILES['photoupload']['size'] > 2 * 1024 * 1024) )
	{
		$error = 'Please upload only files smaller than 2Mb!';
	}
	if (!$error && !($size = @getimagesize($file) ) )
	{
		$error = 'Please upload only images, no other files are supported.';
	}
	if (!$error && !in_array($size[2], array(1, 2, 3, 7, 8) ) )
	{
		$error = 'Please upload only images of type JPEG.';
	}
	if (!$error && ($size[0] < 25) || ($size[1] < 25))
	{
		$error = 'Please upload an image bigger than 25px.';
	}

	$addr = gethostbyaddr($_SERVER['REMOTE_ADDR']);

	$log = fopen('script.log', 'a');
	fputs($log, ($error ? 'FAILED' : 'SUCCESS') . ' - ' . preg_replace('/^[^.]+/', '***', $addr) . ": {$_FILES['photoupload']['name']} - {$_FILES['photoupload']['size']} byte\n" );
	fclose($log);

	if ($error)
	{
		$result['result'] = 'failed';
		$result['error'] = $error;
	}
	else
	{
		$result['result'] = 'success';
		$result['size'] = "Uploaded an image ({$size['mime']}) with  {$size[0]}px/{$size[1]}px.";
	}

}
else
{
	$result['result'] = 'error';
	$result['error'] = 'Missing file or internal error!';
}

if (!headers_sent() )
{
	header('Content-type: application/json');
}

echo json_encode($result);

?>