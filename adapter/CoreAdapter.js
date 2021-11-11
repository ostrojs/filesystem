const path = require('path')
const url = require('url')
const { ensureDir } = require('fs-extra')
const kConfig = Symbol('config')
const kRootPath = Symbol('rootPath')
const kRootUrlPath = Symbol('rootUrlPath')
class CoreAdapter {
    setConfig(config) {
        this[kConfig] = config
    }

    getConfig() {
        return this[kConfig] || null
    }

    setPathPrefix(root) {
        this[kRootPath] = root
    }

    setUrlPrefix(root) {
        this[kRootUrlPath] = root
    }

    applyPathPrefix(dest) {
        return path.resolve(path.join(this[kRootPath], path.join('/', path.normalize(dest))))
    }

    applyUrlPrefix(dest) {
        return url.resolve(([this[kRootUrlPath], (dest || '')].join('/')), '')
    }

    ensureDirectory(dir, callback) {
        ensureDir(dir, callback)
    }

    parsePath(dest) {
        return path.parse(dest)
    }

    dirname(dest) {
        return this.parsePath(dest).dir
    }

    getContent(content) {
        if (Array.isArray(content))
            return content[0]
        else
            return content
    }

    getBufferData(content) {
        return this.getContent(content).buffer
    }
    move(path, newpath, callback) {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {})
    }

    delete($path, options = {}, callback) {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {})

    }

    has($path, options = {}, callback) {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {})

    }

    write($path, $contents, options = {}, ...rest) {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {})

    }

    read($path, options = {}, callback) {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {})

    }
    formatError(err) {
        return {
            'message': 'Storage Error',
            'errors': err,
            'status': 500
        }
    }
}
module.exports = CoreAdapter