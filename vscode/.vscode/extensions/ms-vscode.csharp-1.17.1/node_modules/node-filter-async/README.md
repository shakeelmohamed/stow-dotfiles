# node-filter-async

[![Build Status](https://travis-ci.org/mgenware/node-filter-async.svg?branch=master)](http://travis-ci.org/mgenware/node-filter-async)
[![npm version](https://badge.fury.io/js/node-filter-async.svg)](https://badge.fury.io/js/node-filter-async)
[![Node.js Version](http://img.shields.io/node/v/node-filter-async.svg)](https://nodejs.org/en/)

Filter array elements with Promises.

### Installation
```bash
npm install --save node-filter-async
yarn add node-filter-async
```

Run tests:
```bash
npm test
yarn test
```

## Usage
### API
```javascript
function filterAsync<T>(array: T[], callback: (value: T) => Promise<boolean>): Promise<T[]>;
```

JavaScript:
```javascript
const { filterAsync } = require('node-filter-async');

const results = filterAsync(someArray, async (value) => {
  return await asyncFunc(value) === 'blablabla';
});
```

TypeScript:
```typescript
import { filterAsync } from 'node-filter-async';

const results = filterAsync(someArray, async (value) => {
  return await asyncFunc(value) === 'blablabla';
});
```
