# Unit Tests and E2E Tests Guide

Make sure you have dependencies installed (`npm install`)

## Run Tests

```sh
npm test
```

This will run tests from `tests/` directory and `examples/` directory.

`tests/` directory has the unit tests that test particular functions from the abell. More info at [Unit Test Guide](#unit-test-guide)

`examples/` directory has tests for that example. Check out [E2E Test Guide](#e2e-test-guide) for more information on how it works.


## Unit Test Guide

```sh
npm run test:unit
```

Running this on root level will run tests from `tests/` directory.


We use [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) for writing unit tests.


## E2E Test Guide

```sh
npm run test:e2e
```

We use [mocha](https://mochajs.org/), [chai](https://www.chaijs.com/), and [cheerio](https://cheerio.js.org/) for writing unit tests.

cheerio lets us write jQuery selectors in Node.js, with this, in every example, we check if the element has the expected value.

E2E Test,
- builds the example and outputs a static website in `examples/<example-name>/dist`
- In the `dist`, checks if the rendered HTML has the expected values in test nodes.