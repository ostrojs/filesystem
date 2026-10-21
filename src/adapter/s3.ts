import CoreAdapter from './CoreAdapter';

const kClient: unique symbol = Symbol('client');
const kHandler: unique symbol = Symbol('handler');

/**
 * Class S3.
 */
class S3 extends CoreAdapter {
    [kClient]: any;
    [kHandler]: any;

    /**
     * Create a new instance.
     *
     * @param $client - S3 client instance.
     * @param $config - Configuration options.
     */
    constructor($client: any, $config: Record<string, any>) {
        super();
        this[kClient] = $client;
        this[kHandler] = typeof $config.handler == 'function' ? new $config.handler() : typeof $config.handler == 'object' ? $config.handler : {};
        this.setUrlPrefix(this[kClient].url);
    }

    /**
     * read method.
     *
     * @param $path - File path to read.
     * @param options - Read options.
     * @param callback - Completion callback.
     */
    public read($path: string, options: Record<string, any> = {}, callback: Function): void {
        const basePath: string = this.applyUrlPrefix();
        $path = $path.replaceAll('\\', '/');
        if ($path.charAt(0) == '/') {
            $path = $path.substr(1);
        }
        this[kClient].getConnection().getObject({ Key: $path }).promise()
            .then((response: any) => ({ error: null, data: response.Body }))
            .catch((error: any) => Promise.resolve({ error, data: null }))
            .then(({ error, data }: { error: any; data: any }) => {
                if (typeof this[kHandler].read == 'function') {
                    this[kHandler].read({
                        path: $path,
                        options,
                        callback,
                        error,
                        basePath,
                        contents: data
                    });
                } else {
                    callback(error, function() {
                        return {
                            'type': 'file',
                            'path': $path,
                            'contents': (options.dataType == 'base64') ? data.toString('base64') : data.toString(),
                        };
                    }, basePath);
                }
            });
    }

    /**
     * write method.
     *
     * @param $path - Destination file path.
     * @param data - File content to upload.
     * @param options - Upload options.
     * @param callback - Completion callback.
     */
    public write($path: string, data: any, options: Record<string, any> = {}, callback: Function): void {
        $path = $path.replaceAll('\\', '/');
        if ($path.charAt(0) == '/') {
            $path = $path.substr(1);
        }
        const basePath: string = this.applyUrlPrefix();
        this[kClient].getConnection().upload({
                Key: $path,
                Body: data.toString('base64'),
            }).promise()
            .then((response: any) => ({ error: null, response }))
            .catch((error: any) => Promise.resolve({ error, response: null }))
            .then(({ error, response }: { error: any; response: any }) => {
                if (typeof this[kHandler].write == 'function') {
                    this[kHandler].write({
                        path: $path,
                        options,
                        callback,
                        error,
                        basePath,
                        response,
                        contents: data
                    });
                } else {
                    callback(error, function() {
                        return {
                            'type': 'file',
                            'path': $path,
                            'message': 'File uploaded successfully'
                        };
                    }, basePath);
                }
            });
    }
}

export default S3;