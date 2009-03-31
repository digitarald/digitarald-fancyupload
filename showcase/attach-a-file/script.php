<?php

$result = array();

$result['addr'] = gethostbyaddr($_SERVER['REMOTE_ADDR']);

$result['get'] = $_GET;
$result['post'] = $_POST;

$result['files'] = $_FILES;
foreach ($result['files'] as &$file) {
	$file['md5'] = md5_file($file['tmp_name']);
}

$result['env'] = array(
	'agent' => $_SERVER['HTTP_USER_AGENT']
);

$log = fopen('script.log', 'a');
fputs($log, print_r($result, true) . "\n---\n");
fclose($log);

if (!headers_sent()) {
	header('Content-type: text/xml');
}

$status = isset($_FILES['Filedata']) && is_uploaded_file($_FILES['Filedata']['tmp_name']);

$md5 = $status ? md5_file($_FILES['Filedata']['tmp_name']) : '0';


?>
<response>
	<check><?= $md5 ?></check>
	<name><![CDATA[<?= $_FILES['Filedata']['name'] ?>]]></name>
	<status><?= (int) $status ?></status>
</response>