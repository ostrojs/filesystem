const CoreAdapter = require('./CoreAdapter')
const kClient = Symbol('client')
const kHandler = Symbol('handler')
const { v4 } = require("uuid");
const path = require('path')

class Azure extends CoreAdapter {

    constructor($client, $config) {
        super()
        this[kClient] = $client;
        this[kHandler] = typeof $config.handler == 'function' ? new $config.handler : typeof $config.handler == 'object' ? $config.handler : {};
        this.setUrlPrefix(this[kClient].url)
    }

    read($path, options = {}, callback) {
        let basePath = this.applyUrlPrefix();
        $path = $path.replaceAll('\\', '/')
        if ($path.charAt(0) == "/") {
            $path = $path.substr(1)
        }
        this[kClient].getConnection().getObject({ Key: $path }).promise()
            .then(response => ({ error: null, data: response.Body }))
            .catch(error => Promise.resolve({ error, data: null }))
            .then(({ error, data }) => {
                if (typeof this[kHandler].read == 'function') {
                    this[kHandler].read({
                        path: $path,
                        options,
                        callback,
                        error,
                        basePath,
                        contents: data
                    })
                } else {
                    callback(error, function() {
                        return {
                            'type': 'file',
                            'path': $path,
                            'contents': (options.dataType == 'base64') ? data.toString('base64') : data.toString(),
                        }
                    }, basePath)
                }
            });
    }
    write($path, data, options = {}, callback) {

        $path = $path.replaceAll('\\', '/')
        if ($path.charAt(0) == "/") {
            $path = $path.substr(1)
        }
        let basePath = this.applyUrlPrefix();
        this[kClient].getConnection().upload({
                Key: $path,
                Body: data.toString("base64"),
            }).promise()

            .then(response => ({ error: null, response }))
            .catch(error => Promise.resolve({ error, response: null }))
            .then(({ error, response }) => {
                if (typeof this[kHandler].read == 'function') {
                    this[kHandler].write({
                        path: $path,
                        options,
                        callback,
                        error,
                        basePath,
                        response,
                        contents: data
                    })
                } else {
                    callback(error, function() {
                        return {
                            'type': 'file',
                            'path': $path,
                            'message': 'File uploaded successfully'
                        }
                    }, basePath)
                }
            });
    }

}
module.exports = Azure