# Unit Tests and E2E Tests Guide

Make sure you have dependencies installed (`npm install`) to run the tests.


## Running Unit Test

```sh
npm run test:unit
```

Running this on root level will run tests from `tests/` directory.


We use [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) for writing unit tests.


## End-to-end Test

```sh
npm run test-server # to start server
```

This will build the projects from `tests/cypress/examples/` and will run a server on `examples`.

While the server is running, you can open a different terminal and run
```sh
npm run test:e2e
```

This will run end-to-end test and check if all the abell projects in examples directory, output the expected results.