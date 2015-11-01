import test from 'ava';


test('foo', t => {
    t.pass();
    t.end();
});

test('bar', t => {
    t.plan(2);

    setTimeout(() => {
        t.is('bar', 'bar');
        t.same(['a', 'b'], ['a', 'b']);
    }, 100);
});
