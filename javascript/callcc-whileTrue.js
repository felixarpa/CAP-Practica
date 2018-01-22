Continuation.callcc = function(aBlock) {
    return aBlock(new Continuation());
}

x = 0;
var lessThan6 = function() {
    return x < 6;
}
var printAndIncrement = function() {
    print("x = " + x);
    return ++x;
}

var whileTrue = function(booleanBlock, executionBlock) {
    var cont = Continuation.callcc(function(cc) {
        return cc;
    });
    if (booleanBlock()) {
        executionBlock();
        cont(cont);
    } else {
        return null;
    }

}

whileTrue(lessThan6, printAndIncrement);

/*
x = 0
x = 1
x = 2
x = 3
x = 4
x = 5
*/
