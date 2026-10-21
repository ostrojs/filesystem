const kConnection: unique symbol = Symbol('connection');

/**
 * Class S3Client.
 */
class S3Client {
    [kConnection]: any;

    /**
     * Create a new instance.
     *
     * @param $config - S3 connection options.
     */
    constructor($config: Record<string, any>) {
        this.applyConnection($config);
        return this;
    }

    /**
     * getConnection method.
     *
     * @returns S3 instance.
     */
    public getConnection(): any {
        return this[kConnection];
    }

    /**
     * applyConnection method.
     *
     * @param $config - S3 connection options.
     */
    public applyConnection($config: Record<string, any>): void {
        const awsSdk = require('aws-sdk');
        const S3 = awsSdk.S3;
        this[kConnection] = new S3({
            accessKeyId: $config['key'],
            secretAccessKey: $config['secret'],
            params: { Bucket: $config['bucket'] }
        });
    }
}

export default S3Client;