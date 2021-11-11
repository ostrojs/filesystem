const ServiceProvider = require('@ostro/support/serviceProvider');
const FilesystemManager = require('./filesystemManager');
const Filesystem = require('./filesystem');
class filesystemServiceProvider extends ServiceProvider {

    register() {
        this.registerNativeFilesystem();

        this.registerFlysystem();
    }

    registerNativeFilesystem() {
        this.$app.singleton('files', function() {
            return new Filesystem;
        });
    }

    registerFlysystem() {
        this.registerManager();

        this.$app.singleton('filesystem.disk', ($app) => {
            return $app['filesystem'].disk(this.getDefaultDriver());
        });

        this.$app.singleton('filesystem.cloud', ($app) => {
            return $app['filesystem'].disk(this.getCloudDriver());
        });
    }

    registerManager() {
        this.$app.singleton('filesystem', function($app) {
            return new FilesystemManager($app);
        });
    }

    getDefaultDriver() {
        return this.$app['config']['filesystems.default'];
    }

    getCloudDriver() {
        return this.$app['config']['filesystems.cloud'];
    }
    boot() {

    }

}
module.exports = filesystemServiceProvider