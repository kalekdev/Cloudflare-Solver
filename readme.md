# Cloudflare Solver API
This is an incomplete Cloudflare solver for an old version written by me and @21a1ss3, which has been open-sourced for educational purposes. It was used to get past the `Please wait while we check your browser...` message found on many Cloudflare sites without a browser. Not all the possible challenges were completed meaning it did not work everytime. A challenge harvester was planned in order to collect all possible remaining challenges and add support for them.

### How it works
The solver would first fetch the challenge orchestrator script and use an AST to extract the changes to the solver state and construct the challenge URL. A virtual DOM context was then created with the necessary additional browser functions added to it (such as fake image rendering and certain css functions which are tested by the challenges), in which the challenge script is then ran. Several deobfuscation scripts can be found in `scripts/deobfuscators` which were used to analyse the challenges during development. If the Cloudflare context was correct after running the challenges, then a valid `cfclearance` cookie is received, which is then returned to the user allowing them to make requests to the site freely.

### Dev setup:
1. `npm install` to install required + dev dependencies.
2. `npm start` to compile and execute the application.

### Production setup:
1. Install NodeJs and npm https://nodejs.org/en/download/
2. `npm install -g typescript` to install Typescript globally.
3. `npm install` to install required dependencies.
4. `npm run` to run the compiled application.

