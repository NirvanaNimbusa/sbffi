require('./ensure-built');

const sbffi = require('../lib/index.js');
const ffi = require('ffi-napi');
const { add: napiAdder, sbAdd } = require('./napiaddon');
const { requireWat } = require('require-wat');
const path = require('path');

const libraryPath = path.join(__dirname, 'adder', 'libadder.so');

let u32 = 'ulong';
const { test_add_uint32_t: ffiAdder } = ffi.Library(libraryPath, {
  test_add_uint32_t: [u32, [u32, u32]]
});

u32 = 'uint32_t';
const sbffiAdder = sbffi.getNativeFunction(libraryPath, 'test_add_uint32_t', u32, [u32, u32]);

const { add: wasmAdder } = requireWat(path.join(__dirname, '/adder/adder.wat'));

function jsAdder (a, b) {
  return a + b;
}

const ITERATIONS = Number(process.env.ITERATIONS) || 100000;
const REPS = Number(process.env.REPS) || 5;

for (let j = 0; j < REPS; j++) {
  console.time('ffi-napi');
  for (let i = 0; i < ITERATIONS; i++) {
    ffiAdder(i, i);
  }
  console.timeEnd('ffi-napi');

  console.time('sbffi');
  for (let i = 0; i < ITERATIONS; i++) {
    sbffiAdder(i, i);
  }
  console.timeEnd('sbffi');

  console.time('napi-addon');
  for (let i = 0; i < ITERATIONS; i++) {
    napiAdder(i, i);
  }
  console.timeEnd('napi-addon');

  console.time('napi-addon-sb');
  for (let i = 0; i < ITERATIONS; i++) {
    sbAdd(i, i);
  }
  console.timeEnd('napi-addon-sb');

  console.time('wasm');
  for (let i = 0; i < ITERATIONS; i++) {
    wasmAdder(i, i);
  }
  console.timeEnd('wasm');

  console.time('js');
  for (let i = 0; i < ITERATIONS; i++) {
    jsAdder(i, i);
  }
  console.timeEnd('js');

  console.log('---');
}
