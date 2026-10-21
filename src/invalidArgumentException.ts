import InvalidArgumentExceptionContract from '@ostro/contracts/exception/invalidArgumentException';

/**
 * Class InvalidArgumentException.
 */
class InvalidArgumentException extends InvalidArgumentExceptionContract {
    public name: string;
    public message: string;
    public statusCode: number;

    /**
     * Create a new instance.
     *
     * @param error - Error message.
     */
    constructor(error: string) {
        super();
        this.name = this.constructor.name;
        this.message = error;
        this.statusCode = 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default InvalidArgumentException;