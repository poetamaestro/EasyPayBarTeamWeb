<?php
$recaptcha = $_POST['g-recaptcha-response'];

if($recaptcha != ''){
		$secret = "6Lct3isUAAAAALDL70gKTdiY5LB5V-KZ7pco9BqU";
		$ip = $_SERVER['REMOTE_ADDR'];
		$var = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secret&response=$recaptcha&remoteip=$ip");
		$array = json_decode($var, true);
		if($array['success']){
		//true
			echo "soy humano";
		}else{
			echo "eres un robot";
			}
		}else{
			echo "rellene todos los campos";
		}
?>
