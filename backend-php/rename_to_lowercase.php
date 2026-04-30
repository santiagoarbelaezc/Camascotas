<?php
$dirs = ['Config', 'Controllers', 'Middleware', 'Utils'];

foreach ($dirs as $dir) {
    $oldDir = __DIR__ . '/' . $dir;
    $newDir = __DIR__ . '/' . strtolower($dir);

    if (is_dir($oldDir)) {
        // Rename files inside
        $files = scandir($oldDir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            $oldFile = $oldDir . '/' . $file;
            $newFile = $oldDir . '/' . strtolower($file);
            if ($oldFile !== $newFile) {
                echo "Renaming file: $file -> " . strtolower($file) . "\n";
                rename($oldFile, $newFile);
            }
        }

        // Rename folder (Windows hack: rename to temp first)
        if ($oldDir !== $newDir) {
            echo "Renaming folder: $dir -> " . strtolower($dir) . "\n";
            $tempDir = $oldDir . '_temp';
            rename($oldDir, $tempDir);
            rename($tempDir, $newDir);
        }
    }
}
echo "Normalization complete.\n";
