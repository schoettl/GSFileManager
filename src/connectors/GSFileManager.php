<?php
/**
 * Free Web File Manager is free software released under MIT License.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * George Sarafov
 * http://freewebfilemanager.com
 *
 */

// Alle Methoden in GSFileSystemFileStorage verwenden ausschliesslich die
// "low-level" PHP Filesystem Functions innerhalb.  Sie rufen sich nicht
// gegenseitig oder selbst auf.  Wenn man sich darueber hinwegsetzt hat man
// schnell Encoding-Probleme!
// Ausnahmen: deleteDirectory, copyDirectory (wegen Rekursion)
class GSFileSystemFileStorage {

    static private function toCP1252($string) { // from UTF-8
        return iconv('UTF-8', 'CP1252', $string);
    }

    static private function toUTF8($string) { // from CP1252
        return iconv('CP1252', 'UTF-8', $string);
    }

    public function is_dir($file) {
        $file = self::toCP1252($file);
        return @is_dir($file);
    }

    public function file_exists($file) {
        $file = self::toCP1252($file);
        return @file_exists($file);
    }

    public function scandir($file) {
        $file = self::toCP1252($file);
        $result = @scandir($file); // returns array with filenames
        return array_map(array(__CLASS__, 'toUTF8'), $result);
    }

    public function filesize($file) {
        $file = self::toCP1252($file);
        return @filesize($file);
    }

    public function deleteFile($file) {
        $file = self::toCP1252($file);
        return @unlink($file);
    }

    public function deleteDirectory($dirname) {
        $dirname_utf8 = $dirname;
        $dirname = self::toCP1252($dirname);
        $files = scandir($dirname);
        if (count($files) > 2) {
            foreach( $files as $file ) {
                if (GSFileManager::isNoRealFileOrFolder($file)) {
                    continue;
                }
                $file_utf8 = self::toUTF8($file);
                if (is_dir($dirname . '/' . $file)) {
                    $this->deleteDirectory($dirname_utf8 . '/' . $file_utf8);
                } else {
                    @unlink($dirname . '/' . $file);
                }
            }
        }
        return rmdir($dirname);
    }

    public function makeDirectory($dirname) {
        $dirname = self::toCP1252($dirname);
        return @mkdir($dirname);
    }

    public function makeFile($filename) {
        $filename = self::toCP1252($filename);
        if (($handle = fopen($filename, 'w'))) {
            fclose($handle);
            return true;
        }
        return false;
    }

    public function filemtime($filename) {
        $filename = self::toCP1252($filename);
        return @filemtime($filename);
    }

    public function copyFile($from, $to) {
        $from = self::toCP1252($from);
        $to   = self::toCP1252($to);
        return @copy($from, $to);
    }

    public function copyDir($src, $dst) {
        $src = self::toCP1252($src);
        $dst = self::toCP1252($dst);
        $dir = opendir($src);
        $result = @mkdir($dst);
        while (($file = readdir($dir)) !== false) {
            if (GSFileManager::isNoRealFileOrFolder($file)) {
                continue;
            }
            if (is_dir($src . '/' . $file)) {
                $this->copyDir($src . '/' . $file, $dst . '/' . $file);
            }
            else {
                copy($src . '/' . $file,$dst . '/' . $file);
            }
        }
        closedir($dir);
        return $result;
    }

    public function renameItem($from, $to) {
        $from = self::toCP1252($from);
        $to   = self::toCP1252($to);
        return @rename($from, $to);
    }

    public function readFile($filename) {
        $filename = self::toCP1252($filename);
        return file_get_contents($filename);
    }

    public function writeFile($filename, $content) {
        $filename = self::toCP1252($filename);
        return @file_put_contents($filename, $content);
    }

    public function move_uploaded_file ($from, $to) {
        $from = self::toCP1252($from);
        $to   = self::toCP1252($to);
        return @move_uploaded_file($from, $to);
    }

    public function parseImage($ext,$img,$file = null){
        $result = false;
        switch($ext){
            case 'png':
                $result = imagepng($img,($file != null ? $file : ''));
            break;
            case 'jpeg':
                $result = imagejpeg($img,($file ? $file : ''),90);
            break;
            case 'jpg':
                $result = imagejpeg($img,($file ? $file : ''),90);
            break;
            case 'gif':
                $result = imagegif($img,($file ? $file : ''));
            break;
        }
        return $result;
    }

     public function imagecreatefrompng($src) {
         return imagecreatefrompng($src);
     }

     public function imagecreatefromjpeg($src){
         return imagecreatefromjpeg($src);
     }

     public function imagecreatefromgif($src){
          return imagecreatefromgif($src);
     }
}

class GSFileManager {

    const ROOT_PARAM = 'rootDir';
    const FIRST_ROOT_DIR = 0;
    private $options;
    private $opt_param = 'opt';
    private $fileStorage;
    private $setUtf8Header = true;
    private $functions;

    static private $simpleSuccessAnswer = '{"result":"1"}';
    static private $simpleFailureAnswer = '{"result":"0"}';
    static private function makeFailureAnswer($errorMessage) {
        $answer = array(
            'result'  => '0',
            'gserror' => $errorMessage
        );
        return json_encode($answer);
    }

    public function __construct($fileStorage, $options){
        $this->fileStorage = $fileStorage;
        $this->options = $options;
        $this->functions = array();
        $this->functions[1] = 'listDir';
        $this->functions[2] = 'makeFile';
        $this->functions[3] = 'makeDirectory';
        $this->functions[4] = 'deleteItems';
        $this->functions[5] = 'copyItems';
        $this->functions[6] = 'renameItem';
        $this->functions[7] = 'moveItems';
        $this->functions[8] = 'downloadItem';
        $this->functions[9] = 'readFile';
        $this->functions[10] = 'writeFile';
        $this->functions[11] = 'uploadFile';
        $this->functions[14] = 'copyAsFile';
        $this->functions[16] = 'zipItems';
        $this->functions[17] = 'unZipItems';
    }

    public function getOptionValue ($key, $default = null) {
        $result = $default;
        if (isset($this->options[$key])) {
            $result = $this->options[$key];
        }
        return $result;
    }

    public function getRequestFunction($index){
        $result = null;
        if (isset($this->functions[$index])) {
            $result = $this->functions[$index];
        }
        return $result;
    }

    public function process($args){
        if (!isset($args[$this->opt_param])) {
            $args[$this->opt_param] = 1;
        }
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        if ($root == null) {
            throw new Exception('ConfigurationException: root can NOT be null', 1);
        }
        if (!isset($args['dir']) || empty($args['dir'])) {
            throw new Exception('IllegalArgumentException: dir can NOT be null', 4);
        }
        $response = '';
        $functionName = $this->getRequestFunction($args[$this->opt_param]);
        if ($functionName != null) {
            $response = $this->$functionName($args);
        } else {
            throw new Exception('IllegalArgumentException: Uknown action ' . $args[$this->opt_param], 6);
        }
        if ($this->setUtf8Header) {
            header ('Content-Type: application/json; charset=UTF-8');
        }
        return $response;
    }

    public function unZipItems($args) {
        $this->checkParemter_filename($args);
        $this->checkParemter_newfilename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir = $args['dir'];
        $filename = $args['filename'];
        $newFilename = $args['newfilename'];

        if (!$this->fileStorage->file_exists($root . $dir . $filename)) {
            throw new Exception('IllegalArgumentException: Source does not exists ' . $dir . $filename, 7);
        }
        if ($this->fileStorage->file_exists($root . $dir . $newFilename)) {
            throw new Exception('IllegalArgumentException: Destination already exists', 8);
        }
        $archive = new ZipArchive();
        if ($archive->open($root . $dir . $filename)){
            $archive->extractTo($root . $dir . basename($newFilename));
            $archive->close();
            return self::simpleSuccessAnswer;
        } else {
            return self::simpleFailureAnswer;
        }
    }

    public function zipItems($args) {
        $this->checkParemter_filename($args);
        $this->checkParemter_newfilename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir = $args['dir'];
        $filename = $args['filename'];
        $newFilename = $args['newfilename'];

        if (!$this->fileStorage->file_exists($root . $dir . $filename)) {
            throw new Exception('IllegalArgumentException: Source does not exists ' . $dir . $filename, 7);
        }
        if ($this->fileStorage->file_exists($root . $dir . $newFilename)) {
            throw new Exception('IllegalArgumentException: Destination already exists', 8);
        }
        $archive = new ZipArchive();
        if ($archive->open($root . $dir . $newFilename, ZIPARCHIVE::CREATE)) {
            if ($this->fileStorage->is_dir($root . $dir . $filename)) {
                $this->ZipArchive_addDirectory($archive, rtrim($root . $dir . $filename, '/\\'));
            } else {
                $zipArchive->addFile($root . $dir . $filename, $dir);
            }
            $archive->close();
            return self::simpleSuccessAnswer;
        } else {
            return self::simpleFailureAnswer;
        }
    }

    // $dirname: VerzeichnisNAME also OHNE trailing DIR_SEP! $localname dito.
    private function ZipArchive_addDirectory($zipArchive, $dirname, $localname = null) {
        if ($localname === null) {
            $localname = basename($dirname);
        }
        $dirname   .= '/';
        $localname .= '/';

        $zipArchive->addEmptyDir($localname);
        $files = $this->fileStorage->scandir($dirname);
        foreach ($files as $file) {
            if (GSFileManager::isNoRealFileOrFolder($file)) {
                continue;
            }
            $source = $dirname . $file;
            $dest = $localname . $file;
            if ($this->fileStorage->is_dir($source)) {
                $this->ZipArchive_addDirectory($zipArchive, $source, $dest);
            } else {
                $zipArchive->addFile($source, $dest);
            }
        }
    }

    public function uploadFile($args) {
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir = $args['dir'];
        if (empty($_FILES)) {
            throw new Exception('IllegalArgumentException: no files for upload', 11);
        }
        $maxSize = $this->getOptionValue('max_upload_filesize', 0);
        $response = self::simpleFailureAnswer;
        foreach ($_FILES as $file) {
            if (!$this->fileStorage->file_exists($root . $dir . $file['name'])) {
                if ($maxSize > 0 && $maxSize < intval($file['size']) / 1000) {
                    throw new Exception('IllegalArgumentException: File to large ' . $file['name'], 14);
                }
                $this->checkFilename($file['name']);
                if ($this->fileStorage->move_uploaded_file($file['tmp_name'], $root . $dir . $file['name'])){
                    $response = self::simpleSuccessAnswer;
                }
            } else {
                throw new Exception('IllegalArgumentException: Destination already exists ' . $file['name'], 8);
            }
        }
        return $response;
    }

    public function copyAsFile($args) {
        $this->checkParemter_filename($args);
        $this->checkParemter_newfilename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir = $args['dir'];
        $filename = $args['filename'];
        $newFilename = $args['newfilename'];
        $src =  $root . $dir . $filename;
        $dest = $root . $dir . $newFilename;
        if (!$this->fileStorage->file_exists($src)) {
            throw new Exception('IllegalArgumentException: Source does not exists', 7);
        }
        if ($this->fileStorage->file_exists($dest)) {
            throw new Exception('IllegalArgumentException: Destination already exists ' . $dir . $newFilename, 8);
        }
        if ($this->fileStorage->copyFile($src, $dest)) {
            return self::simpleSuccessAnswer;
        } else {
            return self::makeFailureAnswer('Can not copy ' . $dir . $newFilename);
        }
    }

    public function writeFile($args) {
        $this->checkParemter_filename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $content = '';
        if (isset($args['filenContent'])) {
            $content = $args['filenContent'];
        }
        $filename = $args['filename'];
        $dir = $args['dir'];
        if ($this->fileStorage->file_exists($root . $dir . $filename)) {
            if($this->fileStorage->writeFile($root . $dir . $filename, $content) !== false){
                return self::simpleSuccessAnswer;
            }
            return self::makeFailureAnswer('Can not copy ' . $dir . $newFilename);
        } else {
            throw new Exception('IllegalArgumentException: Source does NOT exists', 7);
        }
    }

    public function readFile($args) {
        $this->checkParemter_filename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $filename = $args['filename'];
        $dir = $args['dir'];
        if ($this->fileStorage->file_exists($root . $dir . $filename)) {
            $content = $this->fileStorage->readFile($root . $dir . $filename);
            if (isset($args['base64_encode']) && $args['base64_encode'] == 1) {
                $content = base64_encode($content);
            }
            return $content;
        } else {
            throw new Exception('IllegalArgumentException: Source does NOT exists ' . $filename, 7);
        }
    }

    public function downloadItem($args) {
        $this->checkParemter_filename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $filename = $args['filename'];
        $dir = $args['dir'];
        if ($this->fileStorage->file_exists($root . $dir . $filename)) {
            $content = $this->fileStorage->readFile($root . $dir . $filename);
            header('Content-Description: Download File: ' . $filename);
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Transfer-Encoding: binary');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');
            header('Content-Length: ' . strlen($content));
            echo $content;
            exit;
        } else {
            throw new Exception('IllegalArgumentException: Source does NOT exists', 7);
        }
    }

    public function moveItems($args) {
        $this->checkParameter_files($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir   = $args['dir'];
        $files = $args['files'];
        foreach ($files as $filename) {
            $src  = $root . $filename;
            $dest = $root . $dir . basename($filename);
            if (!$this->fileStorage->file_exists($src)) {
                throw new Exception('IllegalArgumentException: Source does not exists ' . $filename, 7);
            }
            if ($this->fileStorage->file_exists($dest)) {
                throw new Exception('IllegalArgumentException: Destination already exists ' . $filename, 8);
            }
            $success = $this->fileStorage->renameItem($src, $dest);
            if (!$success) {
                return self::simpleFailureAnswer;
            }
        }
        return self::simpleSuccessAnswer;
    }

    public function renameItem($args) {
        $this->checkParemter_filename($args);
        $this->checkParemter_newfilename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir = $args['dir'];
        $filename = $args['filename'];
        $newFilename = $args['newfilename'];
        $src  = $root . $dir . basename($filename);
        $dest = $root . $dir . basename($newFilename);
        if (!$this->fileStorage->file_exists($src)) {
            throw new Exception('IllegalArgumentException: Source does not exists' . $src, 7);
        }
        if ($this->fileStorage->file_exists($dest)) {
            throw new Exception('IllegalArgumentException: Destination already exists', 8);
        }
        $success = $this->fileStorage->renameItem($src, $dest);
        if ($success) {
            return self::simpleSuccessAnswer;
        } else {
            return self::makeFailureAnswer('Can not rename ' . $dir . $filename . ' to ' . $dir . $newFilename);
        }
    }

    public function copyItems($args) {
        $this->checkParameter_files($args);
        $root  = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir   = $args['dir'];
        $files = $args['files'];
        foreach ($files as $filename) {
            $success = false;
            $this->checkFilename($filename);
            $oldFilename = $root . $filename;
            $newFilename = $root . $dir . basename($filename);
            if (!$this->fileStorage->file_exists($oldFilename)) {
                throw new Exception('IllegalArgumentException: Source does not exists: ' . $filename, 7);
            }
            if ($this->fileStorage->file_exists($newFilename)) {
                throw new Exception('IllegalArgumentException: Destination already exists: ' . $filename, 8);
            }
            if ($this->fileStorage->is_dir($oldFilename)) {
                $success = $this->fileStorage->copyDir($oldFilename, $newFilename);
            } else {
                $success = $this->fileStorage->copyFile($oldFilename, $newFilename);
            }
            if (!$success) {
                return self::simpleFailureAnswer;
            }
        }
        return self::simpleSuccessAnswer;
    }

    public function deleteItems($args) {
        $this->checkParameter_files($args);
        $root  = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir   = $args['dir'];
        $files = $args['files'];
        foreach ($files as $filename) {
            $success = false;
            $filename = $dir . $filename;
            $this->checkFilename($filename);
            $fullFilename = $root . $filename;
            if (!$this->fileStorage->file_exists($fullFilename)) {
                throw new Exception('IllegalArgumentException: Source does not exist: ' . $filename, 7);
            }
            if ($this->fileStorage->is_dir($fullFilename)) {
                $success = $this->fileStorage->deleteDirectory($fullFilename);
            } else {
                $success = $this->fileStorage->deleteFile($fullFilename);
            }
            if (!$success) {
                return self::simpleFailureAnswer;
            }
        }
        return self::simpleSuccessAnswer;
    }

    public function makeFile($args) {
        $this->checkParemter_filename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir = $args['dir'];
        $filename = $args['filename'];
        if (!$this->fileStorage->file_exists($root . $dir . $filename)) {
            if ($this->fileStorage->makeFile($root . $dir . $filename)) {
                return self::simpleSuccessAnswer;
            }
            return self::makeFailureAnswer('Can not create ' . $dir . $filename);
        } else {
            throw new Exception('IllegalArgumentException: Destination already exists', 8);
        }
        return self::simpleFailureAnswer;
    }

    public function makeDirectory($args) {
        $this->checkParemter_filename($args);
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir = $args['dir'];
        $filename = $args['filename'];
        if ($this->fileStorage->file_exists($root . $dir . $filename) || $this->fileStorage->makeDirectory($root . $dir . $filename)) {
            return self::simpleSuccessAnswer;
        }
        return self::simpleFailureAnswer;
    }

    public function listDir($args) {
        $root = $this->getOptionValue(self::ROOT_PARAM)[self::FIRST_ROOT_DIR]['path'];
        $dir = $args['dir'];
        if ($this->fileStorage->file_exists($root . $dir)) {
            $files = $this->fileStorage->scandir($root . $dir);
            natcasesort($files);
            $result = array(
                'gsdirs'  => array(),
                'gsfiles' => array()
            );
            foreach ($files as $file) {
                if (GSFileManager::isNoRealFileOrFolder($file)) {
                    continue;
                }
                $newItem = array(
                    'name' => $file,
                    'path' => $dir . $file,
                    'id'   => md5($dir . $file),
                    'lastMod' => date('Y-m-d H:i:s', $this->fileStorage->filemtime($root . $dir . $file))
                );
                if ($this->fileStorage->is_dir($root . $dir . $file)) {
                    $newItem['type']       = 'dir';
                    $newItem['extension']  = '';
                    $newItem['size']       = 0;
                    $result['gsdirs'][] = $newItem;
                } else {
                    $newItem['type']       = 'file';
                    $newItem['extension']  = strtolower(GSFileManager::getFileExtension($file));
                    $newItem['size']       = $this->fileStorage->filesize($root . $dir . $file);
                    $result['gsfiles'][] = $newItem;
                }
            }
            return json_encode($result);
        } else {
            throw new Exception('IllegalArgumentException: dir to list does NOT exists ' . $dir, 3);
        }
    }

    public function checkFilename($filename) {
        $this->checkPathname($filename); // filename koennte ja auch als "teilpfad/filename" missbraucht werden
    }

    public function checkPathname($pathname) {
        if ($pathname === '..' ||
            GSFileManager::stringStartsWith($pathname, '../') ||
            GSFileManager::stringEndsWith  ($pathname, '/..') ||
            strpos($pathname, '/../') !== false
        ) {
            throw new Exception('IllegalArgumentException: Relative paths are not allowed . ');
        }
    }

    public function checkParameter_files($args) {
        if (!isset($args['files']) || !is_array($args['files'])) {
            throw new Exception('IllegalArgumentException: Illegal request', 5);
        }
    }

    public function checkParemter_filename($args) {
        if (!isset($args['filename'])) {
            throw new Exception('IllegalArgumentException: Illegal request', 5);
        }
    }

    public function checkParemter_newfilename($args) {
        if (!isset($args['newfilename'])) {
            throw new Exception('IllegalArgumentException: Illegal request', 5);
        }
    }

    static function stringStartsWith($haystack, $needle) {
        return !strncmp($haystack, $needle, strlen($needle));
    }

    static function stringEndsWith($haystack, $needle) {
        $length = strlen($needle);
        if ($length == 0) {
            return true;
        }
        return (substr($haystack, -$length) === $needle);
    }

    static function getFileExtension($filename) {
        $lastPos = strrpos($filename, '.');
        return ($lastPos === false) ? 'unknown' : substr($filename, $lastPos + 1);
    }

    static function isNoRealFileOrFolder($filename) {
        return $filename === '.' || $filename === '..';
    }
}
