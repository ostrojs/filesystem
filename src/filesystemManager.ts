import util from 'node:util';
import Manager from '@ostro/support/manager';
import InvalidArgumentException from './invalidArgumentException';
import FilesystemAdapter from './filesystemAdapter';
import callbackHandler from './callbackHandler';
import LocalAdapter from './adapter/local';
import AzureAdapter from './adapter/azure';
import S3Adapter from './adapter/s3';
import AzureClient from './clients/azure';
import S3Client from './clients/s3';

const kHandler: unique symbol = Symbol('handler');

/**
 * Class FileSystemManager.
 */
class FileSystemManager extends Manager {
    public $type: string = 'filesystem';
    [kHandler]: any;

    /**
     * Create a new instance.
     *
     * @param $app - Application instance.
     */
    constructor($app: any) {
        super($app);
        this[kHandler] = this.getConfig('handler');
        if (!this[kHandler]) {
            this[kHandler] = new callbackHandler();
        } else if (typeof this[kHandler] == 'function') {
            util.inherits(this[kHandler], callbackHandler);
            this[kHandler] = new this[kHandler]();
        } else if (typeof this[kHandler] == 'object') {
            let HandlerClass = this[kHandler].constructor;
            if (HandlerClass && HandlerClass !== Object) {
                util.inherits(HandlerClass, callbackHandler);
                this[kHandler] = Object.assign(new HandlerClass(), this[kHandler]);
            } else {
                this[kHandler] = Object.assign(new callbackHandler(), this[kHandler]);
            }
        }
    }

    /**
     * drive method.
     *
     * @param $name - Driver or disk name.
     * @returns FilesystemAdapter instance.
     */
    public drive($name: string | null = null): any {
        return this.driver($name);
    }

    /**
     * disk method.
     *
     * @param name - Disk name.
     * @returns FilesystemAdapter instance.
     */
    public disk(name: string | null = null): any {
        return this.driver(name);
    }

    /**
     * cloud method.
     *
     * @returns Default cloud FilesystemAdapter instance.
     */
    public cloud(): any {
        const name = this.getDefaultCloudDriver();
        return this.disk(name);
    }

    /**
     * resolve method.
     *
     * @param $name - Disk name to resolve.
     * @returns Resolved FilesystemAdapter instance.
     */
    public resolve($name: string): any {
        const $config = this.getConfig($name);
        if (!$config) {
            throw new InvalidArgumentException("Disk [" + $name + "] was not available.");
        }
        return super.resolve($name, $config);
    }

    /**
     * createLocalDriver method.
     *
     * @param $config - Driver configuration.
     * @returns FilesystemAdapter for local storage.
     */
    public createLocalDriver($config: Record<string, any>): FilesystemAdapter {
        return this.adapt(new LocalAdapter($config['root'], $config), $config);
    }

    /**
     * createAzureDriver method.
     *
     * @param $config - Driver configuration.
     * @returns FilesystemAdapter for Azure storage.
     */
    public createAzureDriver($config: Record<string, any>): FilesystemAdapter {
        return this.adapt(new AzureAdapter(new AzureClient($config), $config), $config);
    }

    /**
     * createS3Driver method.
     *
     * @param $config - Driver configuration.
     * @returns FilesystemAdapter for S3 storage.
     */
    public createS3Driver($config: Record<string, any>): FilesystemAdapter {
        return this.adapt(new S3Adapter(new S3Client($config), $config), $config);
    }

    /**
     * adapt method.
     *
     * @param adapter - Core adapter instance.
     * @param config - Driver configuration.
     * @returns FilesystemAdapter wrapping core adapter.
     */
    public adapt(adapter: any, config: Record<string, any>): FilesystemAdapter {
        return new FilesystemAdapter(adapter, this[kHandler]);
    }

    /**
     * getConfig method.
     *
     * @param name - Disk configuration key.
     * @returns Configuration object.
     */
    public getConfig(name: string): any {
        return super.getConfig(`disks.${name}`) || super.getConfig(name);
    }

    /**
     * getDefaultCloudDriver method.
     *
     * @returns Name of default cloud driver.
     */
    public getDefaultCloudDriver(): string {
        return super.getConfig('cloud');
    }

    /**
     * registerToRequest method.
     *
     * @param FileRequest - Request constructor to extend.
     */
    public registerToRequest(FileRequest: any): void {
        const self = this;
        FileRequest.prototype.store = function(dir?: string, disk?: any, options?: any) {
            dir = dir || '';
            options = typeof disk == 'object' ? disk : (options || {});
            disk = typeof disk == 'object' ? '' : (disk || '');
            return self.disk((disk || self.getDefaultDriver())).putFile(dir, this, options);
        };
        FileRequest.prototype.storeAs = function(dir?: string, filename?: string, disk?: any, options?: any) {
            dir = dir || '';
            options = typeof disk == 'object' ? disk : (options || {});
            disk = typeof disk == 'object' ? '' : (disk || '');
            return self.disk((disk || self.getDefaultDriver())).putFileAs(dir, this, filename, options);
        };
    }
}

export default FileSystemManager;