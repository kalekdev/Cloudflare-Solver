import Controller from './controller';
import { Request, Response } from 'express';
import CloudflareSolver, { CloudflareSolverOptions} from "../solve/cloudflareSolver";

export default class CloudflareController extends Controller {
    constructor() {
        super('/cloudflare');
    }

    protected registerRoutes(): void {
        this.router.get('/solve', this.solve.bind(this));
    }

    private async solve(req: Request, res: Response) {
        let options = {
            url: req.query.url as string,
            captcha: Boolean(req.query.captcha) || false
        };

        let solver = new CloudflareSolver(options)

        res.send(await solver.solve())
    }

}