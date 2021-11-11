require('@ostro/support/helpers')
const { Macroable } = require('@ostro/support/macro')
const ObjectGet = require('lodash.get')
const InvalidArgumentException = require('./invalidArgumentException')
const FilesystemAdapter = require('./filesystemAdapter')
const callbackHandler = require('./callbackHandler')
const util = require('util')
const kApp = Symbol('app')
const kDisks = Symbol('disks')
const kHandler = Symbol('handler')
const kCustomCreators = Symbol('customCreators')
class FileSystemManager extends Macroable {
    constructor($app) {
        super()
        Object.defineProperties(this, {
            [kApp]: {
                value: $app,
            },
            [kDisks]: {
                value: Object.create(null),
                writable: true,
            },
            [kCustomCreators]: {
                value: Object.create(null),
                writable: true,
            },

        })
        this[kHandler] = this.getConfig('handler')
        if (typeof this[kHandler] != 'function' || typeof this[kHandler] != 'object') {
            this[kHandler] = callbackHandler
        } else if (typeof this[kHandler] != 'object') {
            this[kHandler] = this[kHandler].constructor
            util.inherits(this[kHandler], callbackHandler)
        } else {
            util.inherits(this[kHandler], callbackHandler)
        }
        this[kHandler] = new this[kHandler]
    }

    drive($name = null) {
        return this.disk($name);
    }

    driver($name = null) {
        return this.disk($name);
    }

    disk(name = null) {
        name = name ? name : this.getDefaultDriver();
        return this[kDisks][name] = this.getDriver(name);
    }
    cloud() {
        var name = this.getDefaultCloudDriver();
        return this[kDisks][name] = this.getDriver(name);
    }

    getDriver(name) {
        return this[kDisks][name] || this.resolve(name);
    }

    resolve($name) {
        var config = this.getConfig($name);
        if (!config) {
            throw new InvalidArgumentException("Disk [{" + $name + "}] was not available.");
        }
        var driverMethod = 'create' + (config['driver']).ucfirst() + 'Driver';
        if ((this[kCustomCreators][config['driver']])) {
            return this.callCustomCreator(config);
        } else if (this[driverMethod]) {
            return this[driverMethod](config);
        } else {
            throw new InvalidArgumentException("Driver [{" + config['driver'] + "}] is not supported.");
        }
    }

    callCustomCreator($config) {
        return this[kCustomCreators][$config['driver']];
    }

    createLocalDriver($config) {
        return this.adapt(new(require('./adapter/local'))($config['root'], $config), $config);
    }

    createAzureDriver($config) {
        return this.adapt(new(require('./adapter/azure'))(new(require('./clients/azure'))($config), $config), $config);
    }

    createS3Driver($config) {
        return this.adapt(new(require('./adapter/s3'))(new(require('./clients/s3'))($config), $config), $config);
    }

    adapt(adapter, config) {
        return new FilesystemAdapter(adapter, this[kHandler]);
    }

    getConfig(name) {
        return ObjectGet(this[kApp]['config']['filesystem']['disks'], name);
    }

    getDefaultDriver() {
        return this[kApp]['config']['filesystem']['default'];
    }

    getDefaultCloudDriver() {
        return this[kApp]['config']['filesystem']['cloud'];
    }
    registerToRequest(FileRequest) {
        let self = this
        FileRequest.prototype.store = function(dir = '', disk = '', options = {}) {
            options = typeof disk == 'object' ? disk : options
            disk = typeof disk == 'object' ? '' : disk
            return self.disk((disk || self.getDefaultDriver())).putFile(dir, this, options)
        }
        FileRequest.prototype.storeAs = function(dir = '', filename, disk = '', options = {}) {
            options = typeof disk == 'object' ? disk : options
            disk = typeof disk == 'object' ? '' : disk
            return self.disk((disk || self.getDefaultDriver())).putFileAs(dir, this, filename, options)
        }

    }
    extends($driver, $callback) {
        const config = this.getConfig($driver)
        if (!config) {
            throw new InvalidArgumentException(`Config not found for  [{${$driver}}] driver.`);
        }
        this[kCustomCreators][config['driver']] = $callback.call(this, this);
        return this;
    }
    __get(target, method) {
        return this.make(target.disk(), method)
    }
}

module.exports = FileSystemManager