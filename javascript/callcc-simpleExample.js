Continuation.callcc = function(aBlock) {
    return aBlock(new Continuation());
}

var cont, x;

x = Continuation.callcc(function(cc) {
    cont = cc;
    return cc(1);
});

if (x == 1) {
    print("x = " + x);
    cont(2);
} else {
    print("x = " + x);
}

/*
x = 1
x = 2
*/