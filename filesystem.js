const FilesystemContract = require('@ostro/contracts/filesystem/filesystem')
const fs = require('fs-extra')
const Finder = require('filehound')
const path = require('path')
const FileNotFoundException = require('./fileNotFoundException')
const FileDeleteException = require('./fileDeleteException')
const FileUploadException = require('./fileUploadException')
const DirectoryCreateException = require('./directoryCreateException')
class Filesystem extends FilesystemContract {

    exists($path) {
        return fs.access($path).then(res => true).catch(err => Promise.resolve(false));
    }

    missing($path) {
        return !this.exists($path);
    }

    get($path) {
        return fs.readFile($path, 'utf8').catch(err => {
            throw new FileNotFoundException(`File does not exist at path ${$path}.`);
        })

    }

    put($path, $contents) {
        return fs.writeFile($path, $contents);
    }

    replaceInFile($search, $replace, $path) {
        this.get($path).then(content => this.put($path, content.replace($search, $replace)));
    }

    prepend($path, $data) {
        return this.exists($path).then(res => this.put($path, ($data + this.get($path)))).catch(err => this.put($path, $data))
    }

    append($path, $data) {
        return fs.appendFile($path, $data);
    }

    chmod($path, $mode = null) {
        if ($mode) {
            return fs.chmod($path, $mode);
        }
        return fs.stat($path).then(stat => {
            console.log(stat)
            console.log(stat.mode)
            return stats.mode
        });

    }

    async delete($paths) {
        $paths = Array.isArray($paths) ? $paths : arguments;

        let $success = true;

        for (let $path of $paths) {
            try {
                if (!await fs.remove($path)) {
                    $success = false;
                }
            } catch ($e) {
                $success = false;
            }
        }

        return $success;
    }

    move($path, $target) {
        return fs.move($path, $target);
    }

    copy($path, $target) {
        return fs.copy($path, $target);
    }

    link($target, $link, $force = false) {
        return fs.symlink($target, $link, 'junction')
    }

    relativeLink($target, $link, $force) {
        $target = path.relative($target, $link);
        return this.link($target, $link, $force);
    }

    name($path) {
        return pathinfo($path, PATHINFO_FILENAME);
    }

    basename($path) {
        return pathinfo($path, PATHINFO_BASENAME);
    }

    dirname($path) {
        return pathinfo($path, PATHINFO_DIRNAME);
    }

    extension($path) {
        return pathinfo($path, PATHINFO_EXTENSION);
    }

    guessExtension($path) {
        return path.extname($path)
    }

    type($path) {
        return filetype($path);
    }

    mimeType($path) {
        return finfo_file(finfo_open(FILEINFO_MIME_TYPE), $path);
    }

    size($path) {
        return filesize($path);
    }

    lastModified($path) {
        return filemtime($path);
    }

    isDirectory($directory) {
        return is_dir($directory);
    }

    isReadable($path) {
        return is_readable($path);
    }

    isWritable($path) {
        return is_writable($path);
    }

    isFile($file) {
        return fs.lstat($file).then(stats => stats.isFile()).catch(err => false);
    }

    glob($pattern) {
        return Finder.create().glob($pattern).find();
    }

    requireOnce($path, $data = []) {
        return this.isFile($path).then($exists => {

            if ($exists) {
                return require($path);

            } else {
                throw new FileNotFoundException("File does not exist at path {$path}.");

            }

        })

    }

    files($directory, $hidden = false) {
        let inst = Finder.create().path($directory)
        if ($hidden) {
            inst.ignoreHiddenDirectories()
        }
        return inst.depth(0).find()

    }

    allFiles($directory, $hidden = false) {
        let inst = Finder.create().path($directory)
        if ($hidden) {
            inst.ignoreHiddenDirectories()
        }
        return inst.find()

    }

    directories($directory) {

        return Finder.create().path($directory).directory().depth(0).sortByName()

    }

    ensureDirectoryExists($path, $mode = 0o755, $recursive = true) {
        return fs.ensureDir($path, $mode).then($exists => true).catch(err => false)

    }

    makeDirectory($path, $mode = 0o755, $recursive = false, $force = false) {
        return fs.mkdir($path, {
            mode: $mode,
            recursive: $recursive
        });

    }

    async moveDirectory($from, $to, $overwrite = false) {
        if ($overwrite && await this.isDirectory($to) && !await this.deleteDirectory($to)) {
            return false;
        }

        return await fs.rename($from, $to) === true;
    }

    async copyDirectory($directory, $destination, $options = null) {
        if (!this.isDirectory($directory)) {
            return false;
        }

        $options = $options ? $options : FilesystemIterator.SKIP_DOTS;

        this.ensureDirectoryExists($destination);

        let $items = await fs.readdir($directory, $options)

        for (let $item of $items) {
            $item = await fs.stat();

            $target = path.join($destination, $item.getBasename())

            if ($item.isDirectory()) {
                $path = $item.getPathname();

                if (!await this.copyDirectory($path, $target, $options)) {
                    return false;
                }
            } else {
                if (!await this.copy($item.getPathname(), $target)) {
                    return false;
                }
            }
        }

        return true;
    }

    async deleteDirectory($directory, $preserve = false) {
        if (!await this.isDirectory($directory)) {
            return false;
        }

        let $items = await fs.readdir($directory)

        for (let $item of $items) {
            $item = await fs.stat();

            if ($item.isDirectory() && !$item.isSymbolicLink()) {
                await this.deleteDirectory($item.getPathname());
            } else {
                await this.delete($item.getPathname());
            }
        }

        if (!$preserve) {
            await this.delete($directory, true);
        }

        return true;
    }

    async deleteDirectories($directory) {
        $allDirectories = await this.directories($directory);

        if (!empty($allDirectories)) {
            for (let $directoryName of $allDirectories) {
                await this.deleteDirectory($directoryName);
            }

            return true;
        }

        return false;
    }

    cleanDirectory($directory) {
        return this.deleteDirectory($directory, true);
    }
}
module.exports = Filesystem