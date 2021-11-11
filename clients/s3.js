const { S3 } = require("aws-sdk");
const kConnection = Symbol('connection')

class S3Client {
    constructor($config) {
        this.applyConnection($config)
        return this
    }
    getConnection() {
        return this[kConnection]
    }
    applyConnection($config) {
        this[kConnection] = new S3({ accessKeyId: $config['key'], secretAccessKey: $config['secret'], params: { Bucket: $config['bucket'] } })
    }

}
module.exports = S3Client