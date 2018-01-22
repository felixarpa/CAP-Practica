Continuation.callcc = function(aBlock) {
    return aBlock(new Continuation());
}

function MakeThreadSystem() {
    this.thunks = [];
}

MakeThreadSystem.prototype.spawn = function(newThunk) {
    var thunk = {};
    thunk._thunk = newThunk;
    thunk._cont = Continuation.callcc(function(cc) {
        return cc;
    });
    console.log("Adding new thunk");
    this.thunks.push(thunk);
}

MakeThreadSystem.prototype.quit = function() {
    this.thunks = this.thunks.slice(1);
    this.thunks[0]._cont(this.thunks[0]._cont);
}

MakeThreadSystem.prototype.relinquish = function() {
    this.thunks.push(this.thunks[0]);
    this.quit();
}

MakeThreadSystem.prototype.startThreads = function() {
    this.thunks[0]._cont(this.thunks[0]._cont);
}