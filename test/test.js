const spawn = require('child_process').spawn;
const test = require('tape');

process.chdir(__dirname);

test('show help', (t) => {
  const cli = spawn('node', ['../index', '--help']);
  cli.stdout.setEncoding('utf8');
  cli.stdout.on('data', (data) => {
    t.assert(data, 'Display help text');
    t.end();
  });
});


test('show version', (t) => {
  t.plan(1);
  const cli = spawn('node', ['../index', '--version']);
  cli.stdout.setEncoding('utf8');
  cli.stdout.on('data', (data) => {
    const regex = new RegExp(require('../package.json').version);
    t.assert(regex.test(data), data);
  });
});
