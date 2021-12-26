const path = require('path')
const FileNotFoundException = require('./fileNotFoundException')
const FileDeleteException = require('./fileDeleteException')
const FileUploadException = require('./fileUploadException')
const DirectoryCreateException = require('./directoryCreateException')
const kAdapter = Symbol('adapter')
const kHandler = Symbol('handler')
class FilesystemAdapter {
    constructor($adapter, $handler) {
        this[kAdapter] = $adapter;
        this[kHandler] = $handler;
    }

    exists($path, options) {

        return new Promise((resolve, reject) => {
            this[kAdapter].has($path, options, (err, data, basePath) => {
                this[kHandler].exists(null, (err ? false : true), resolve, $path, options, basePath)
            })
        })
    }

    path($path) {
        return this[kAdapter].getAdapter().getPathPrefix().$path;
    }

    get($path, options) {

        return new Promise((resolve, reject) => {
            this[kAdapter].read($path, options, (err, data, basePath) => {
                if (err) {
                    this[kHandler].get(new FileNotFoundException(err), null, reject, $path, options, basePath)
                } else {
                    this[kHandler].get(null, (typeof data == 'function' ? data() : data), resolve, $path, options, basePath)
                }
            })
        })
    }

    delete($path, ...rest) {
        rest = Array.from(rest)
        let callback = rest.find(arg => typeof arg == 'function')
        let options = rest.find(arg => typeof arg == 'object') || {}
        if (callback)
            return this[kAdapter].delete($path, options, callback)
        else {
            return new Promise((resolve, reject) => {
                this[kAdapter].delete($path, options, (err, data, basePath) => {
                    if (err) {
                        this[kHandler].delete(new FileDeleteException(err), null, reject, $path, options, basePath)
                    } else {
                        this[kHandler].delete(null, (typeof data == 'function' ? data() : data), resolve, $path, options, basePath)
                    }
                })
            })
        }
    }

    makeDirectory($path, options) {
        return new Promise((resolve, reject) => {
            this[kAdapter].createDir($path, options, (err, data, basePath) => {
                if (err) {
                    this[kHandler].createDir(new DirectoryCreateException(err), null, reject, $path, options, basePath)
                } else {
                    this[kHandler].createDir(null, (typeof data == 'function' ? data() : data), resolve, $path, options, basePath)
                }
            })
        })
    }

    put($path, content, options = {}) {

        return new Promise((resolve, reject) => {
            this[kAdapter].write($path, content, options, (err, data, basePath) => {
                if (err) {
                    this[kHandler].delete(new FileUploadException(err), null, reject, $path, options, basePath, content)
                } else {
                    this[kHandler].put(null, (typeof data == 'function' ? data() : data), resolve, $path, options, basePath)
                }
            })
        })
    }

    putFile($path, $file, $options = {}) {
        return this.putFileAs($path, $file, $file.getHashname(), $options);
    }

    putFileAs($path, $file, $name, $options = {}) {
        $path = path.join($path, $name)
        return this.put($path, $file.getBufferData(), $options);
    }

    getAdapter() {
        return this[kAdapter];
    }

}
module.exports = FilesystemAdapter