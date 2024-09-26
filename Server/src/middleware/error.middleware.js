import { ApiError} from '../utils/apiError.js';

const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).josn({
            success: true,
            message: err.message,
            error: err.errors,
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: [err.message],
    })
}


export default errorMiddleware