class FilesystemHandler {
    exists(error, data, callback, path, options, basePath) {
        if (error) {
            callback(error)
        } else {
            callback(data)
        }

    }

    get(error, data, callback, path, options, basePath) {
        if (error) {
            callback(error)
        } else {
            callback(data)
        }
    }

    delete(error, data, callback, path, options, basePath) {
        if (error) {
            callback(error)
        } else {
            callback(data)
        }
    }

    put(error, data, callback, path, options, basePath) {
        if (error) {
            callback(error)
        } else {
            callback(data)
        }
    }
    global(error, data, callback, path, options) {
        if (error) {
            callback(error)
        } else {
            callback(data)
        }
    }
    createDir(error, data, callback) {
        if (error) {
            callback(error)
        } else {
            callback(true)
        }
    }
}
module.exports = FilesystemHandler