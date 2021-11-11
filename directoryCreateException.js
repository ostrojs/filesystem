const DirectoryCreateExceptionContract = require('@ostro/contracts/filesystem/directoryCreateException')
class DirectoryCreateException extends DirectoryCreateExceptionContract {
    constructor(errors) {
        super();

        this.name = this.constructor.name;
        this.message = 'Unable to create directory';
        this.errors = errors;
        this.statusCode = 404;
        Error.captureStackTrace(this, this.constructor);

    }
}
module.exports = DirectoryCreateException