import ServiceProvider from '@ostro/support/serviceProvider';
import FilesystemManager from './filesystemManager';
import Filesystem from './filesystem';

/**
 * Class filesystemServiceProvider.
 */
class filesystemServiceProvider extends ServiceProvider {

    /**
     * register method.
     */
    public register(): void {
        this.registerNativeFilesystem();
        this.registerFlysystem();
    }

    /**
     * registerNativeFilesystem method.
     */
    public registerNativeFilesystem(): void {
        this.$app.singleton('files', function(): Filesystem {
            return new Filesystem();
        });
    }

    /**
     * registerFlysystem method.
     */
    public registerFlysystem(): void {
        this.registerManager();

        this.$app.singleton('filesystem.disk', ($app: any): any => {
            return $app['filesystem'].disk(this.getDefaultDriver());
        });

        this.$app.singleton('filesystem.cloud', ($app: any): any => {
            return $app['filesystem'].disk(this.getCloudDriver());
        });
    }

    /**
     * registerManager method.
     */
    public registerManager(): void {
        this.$app.singleton('filesystem', function($app: any): FilesystemManager {
            return new FilesystemManager($app);
        });
    }

    /**
     * getDefaultDriver method.
     *
     * @returns Default driver name.
     */
    public getDefaultDriver(): string {
        return this.$app['config']['filesystems.default'];
    }

    /**
     * getCloudDriver method.
     *
     * @returns Cloud driver name.
     */
    public getCloudDriver(): string {
        return this.$app['config']['filesystems.cloud'];
    }

    /**
     * boot method.
     */
    public boot(): void {
    }
}

export default filesystemServiceProvider;