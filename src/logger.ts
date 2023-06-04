import winston from "winston";

class Logger {
    #winston_logger: winston.Logger;

    constructor(){
        this.#winston_logger = winston.createLogger({
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    ),
                }),
            ],
        });
    }

    info(message: string){
        this.#winston_logger.info(message);
    }

    warn(message: string){
        this.#winston_logger.warn(message);
    }

    error(message: string){
        this.#winston_logger.error(message);
    }
}

export default Logger;