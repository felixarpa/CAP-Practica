Continuation.callcc = function(aBlock) {
    return aBlock(new Continuation());
}