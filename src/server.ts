import express, { NextFunction, Request, Response } from 'express';
import Controller from "./controllers/controller";
import CloudflareController from "./controllers/cloudflareController";

export default class Server {
    private app: express.Express;
    private port: string | number;
    private controllers: Controller[];
    private verbose: boolean;

    constructor(verbose: boolean = false) {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.controllers = [
            new CloudflareController()
        ]
        this.verbose = verbose;

        this.registerMiddleware();
        this.registerControllers();
        this.registerErrorHandling();
    }

    start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
        });
    }

    private registerMiddleware(): void {
        this.app.use((req, res, next) => {
            res.type('json');
            next();
        });
    }

    private registerControllers(): void {
        for (const controller of this.controllers) {
            this.app.use(controller.path, controller.router);
        }
    }

    private registerErrorHandling(): void {
        this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            res.status(500).send({
                status: 'failure',
                reason: 'Server error'
            });
            if (this.verbose) {
                console.log(error);
            }
        });
    }
}