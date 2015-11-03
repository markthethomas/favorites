const spawn = require('child_process').spawn;
const test = require('tape');

test('install', (t) => {
  const cli = spawn('node', ['./index.js', 'install', './test/favorites.json']);
  cli.stdout.setEncoding('utf8');
  cli.on('error', (err) => {
    console.log(err);
  });

  cli.on('close', (code) => {
    t.equal(code, 0);
    t.end();
  });
});

test('verbose install', (t) => {
  const cli = spawn('node', ['./index.js', '-v', 'install', './test/favorites.json']);
  cli.stdout.setEncoding('utf8');
  cli.on('error', (err) => {
    console.log(err);
  });

  cli.on('close', (code) => {
    t.equal(code, 0);
    t.end();
  });
});

test('install without favorites', (t) => {
  t.plan(1);
  const cli = spawn('node', ['./index.js', '-v', 'install']);
  cli.stdout.setEncoding('utf8');

  cli.on('error', (err) => {
    console.log(err);
  });

  cli.on('close', (code) => {
    t.equal(code, 1);
  });
});

test('show help', (t) => {
  t.plan(1);
  const cli = spawn('node', ['./index.js', '--help']);
  cli.on('error', (err) => {
    console.log(err);
  });
  cli.stdout.on('data', (data) => {
    t.assert(data, 'Display help text');
  });
});


test('show version', (t) => {
  t.plan(1);
  const cli = spawn('node', ['./index.js', '--version']);
  cli.stdout.on('data', (data) => {
    const regex = new RegExp(require('../package.json').version);
    t.assert(regex.test(data), data);
  });
});
