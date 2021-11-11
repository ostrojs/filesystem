const InvalidArgumentExceptionContract = require('@ostro/contracts/exception/invalidArgumentException')
class InvalidArgumentException extends InvalidArgumentExceptionContract {
    constructor(error) {
        super();
        this.name = this.constructor.name;
        this.message = error;
        this.statusCode = 500;
        Error.captureStackTrace(this, this.constructor);

    }
}
module.exports = InvalidArgumentException