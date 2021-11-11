const fs = require('fs-extra')
const CoreAdapter = require('./CoreAdapter')
const path = require('path')
const kHandler = Symbol('handler')

class Local extends CoreAdapter {
    constructor(root = '', $config) {
        super()
        this.setPathPrefix(root)
        this.setConfig($config)
        this[kHandler] = (typeof $config.handler == 'function' ? new $config.handler : (typeof $config.handler == 'object' ? $config.handler : {}))
    }
    move(path, newpath, callback) {
        if (callback)
            return fs.move(path, newpath, {
                overwrite: true
            }, function(err, res) {
                callback(err, res, newpath)
            })
        else
            return fs.move(path, newpath, {
                overwrite: true
            })
    }
    delete($path, options = {}, callback) {
        let location = this.applyPathPrefix($path);
        fs.remove(location, (error) => {
            if (typeof this[kHandler].delete == 'function') {
                this[kHandler].delete({
                    basePath: location,
                    path: $path,
                    options,
                    callback,
                    error,
                })
            } else {
                callback(error, true, location)
            }
        });
    }
    createDir($path, options = {}, callback) {
        let location = this.applyPathPrefix($path);
        fs.mkdir(location, { recursive: true }, (error) => {
            if (typeof this[kHandler].createDir == 'function') {
                this[kHandler].createDir({
                    path: $path,
                    options,
                    callback,
                    error,
                })
            } else {
                callback(error, true, location)
            }
        });
    }
    has($path, options = { constants: 'F_OK' }, callback) {
        let location = this.applyPathPrefix($path);
        fs.access(location, fs.constants[options.constants], (error) => {
            if (typeof this[kHandler].has == 'function') {
                this[kHandler].has({
                    basePath: location,
                    path: $path,
                    options,
                    callback,
                    error,
                })
            } else {
                callback(error, true)
            }
        });
    }

    write($path, $contents, options = {}, ...rest) {

        let callback = Array.from(rest).find(arg => typeof arg == 'function')
        let location = this.applyPathPrefix($path);
        this.ensureDirectory(this.dirname(location), () => {
            fs.writeFile(location, $contents, (error, data) => {
                if (typeof this[kHandler].write == 'function') {
                    this[kHandler].write({
                        basePath: location,
                        path: $path,
                        options,
                        callback,
                        error,
                        content: $contents
                    })
                } else {
                    callback(error, {
                        'type': 'file',
                        'path': location,
                        'message': 'File created successfully'
                    }, location)
                }
            })
        });

    }

    read($path, options = {}, callback) {
        let location = this.applyPathPrefix($path);
        fs.readFile(location, {
            encoding: (this.getConfig().encoding || (options.encoding || 'utf-8'))
        }, (error, data) => {
            if (typeof this[kHandler].read == 'function') {
                this[kHandler].read({
                    basePath: location,
                    path: $path,
                    options,
                    callback,
                    error,
                    response: data
                })
            } else {
                callback(error, {
                    'type': 'file',
                    'path': $path,
                    'contents': data
                }, location)
            }
        });

    }
    global($path, options = {}, callback) {

    }

}
module.exports = Local