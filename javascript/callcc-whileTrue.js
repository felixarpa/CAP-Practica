Continuation.callcc = function(aBlock) {
    return aBlock(new Continuation());
}

x = 0;
var lessThan3 = function() {
    return x < 3;
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

whileTrue(lessThan3, printAndIncrement);