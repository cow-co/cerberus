# CERBERUS

[![CircleCI Status](https://dl.circleci.com/status-badge/img/gh/cow-co/cerberus/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/cow-co/cerberus/tree/main)
[![Known Vulnerabilities - Backend](https://snyk.io/test/github/cow-co/cerberus/badge.svg?targetFile=backend/package.json)](https://snyk.io/test/github/cow-co/cerberus)
[![Known Vulnerabilities - Frontend](https://snyk.io/test/github/cow-co/cerberus/badge.svg?targetFile=frontend/package.json)](https://snyk.io/test/github/cow-co/cerberus)
[![codecov](https://codecov.io/gh/cow-co/cerberus/graph/badge.svg?token=Y8W7b9ng2Y)](https://codecov.io/gh/cow-co/cerberus)

C2/UI server for administering implants as part of the RICE BOWL suite.

## Disclaimery Type Things

- Do not use this for illegal purposes 
- Do not use the RICE BOWL suite (of which this is a part) against targets/infrastructure you do not own or have express written permission to use it against
- I accept no liability for any damage the use of my tools might cause. 

## Notes for Supporting the System

See [docs/support-notes.md](docs/support-notes.md) for information that can help those who need to support and maintain live instances of CERBERUS.

## Building and Running

### Non-Containerised

1. Build the frontend:
```bash
$ cd frontend
$ npm install
$ npm run build
```
2. Copy built frontend to backend:
```bash
$ mv build ../backend
```
3. Compress the backend directory
```bash
$ cd ../
$ tar -zf backend
```
4. Set up your target machine with the relevant environment variables (see [the config options](docs/configuration-options.md))
5. You can then deploy the archive to your target machine, uncompress it, and run using `npm start`

### Containerised

1. Edit the included Dockerfile, such that it includes the environment variables you need, and such that it copies your cert to the image, etc.
2. Use docker to build the image: `docker build --progress=plain -t cerberus:2.0.0 .`
3. Deploy and run the image as usual

## Assorted TODO items

- [ ] Got to keep the openapi docs up to date
- [ ] Got to clean up some interfaces