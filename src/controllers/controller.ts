import express from 'express';

export default abstract class Controller {
    path: string;
    router: express.Router;

    constructor(path: string) {
        this.path = path;
        this.router = express.Router();

        this.registerRoutes();
    }

    protected abstract registerRoutes(): void;
}