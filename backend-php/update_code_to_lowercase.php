<?php
$replacements = [
    'App\\Config' => 'App\\config',
    'App\\Controllers' => 'App\\controllers',
    'App\\Middleware' => 'App\\middleware',
    'App\\Utils' => 'App\\utils'
];

$dir = __DIR__;
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
$phpFiles = new RegexIterator($iterator, '/\.php$/');

foreach ($phpFiles as $file) {
    $filePath = $file->getPathname();
    if (str_contains($filePath, 'vendor')) continue;
    if (basename($filePath) === 'update_code_to_lowercase.php') continue;
    if (basename($filePath) === 'rename_to_lowercase.php') continue;

    $content = file_get_contents($filePath);
    $newContent = $content;

    foreach ($replacements as $old => $new) {
        $newContent = str_replace($old, $new, $newContent);
    }

    if ($newContent !== $content) {
        echo "Updating code in: " . basename($filePath) . "\n";
        file_put_contents($filePath, $newContent);
    }
}

echo "Code update complete.\n";
