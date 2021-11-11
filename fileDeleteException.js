const fileNotFoundExceptionContract = require('@ostro/contracts/filesystem/fileNotFoundException')
class FileNotFoundException extends fileNotFoundExceptionContract {
    constructor(errors, path) {
        super();
        this.name = this.constructor.name;
        this.message = 'Unable to delete ';
        this.errors = errors;
        this.statusCode = 500;
        Error.captureStackTrace(this, this.constructor);

    }
}
module.exports = FileNotFoundException