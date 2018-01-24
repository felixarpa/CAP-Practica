Continuation.callcc = function(aBlock) {
    return aBlock(new Continuation());
}

Continuation.current = function() {
    return Continuation.callcc(function(cc) { return cc; });
}

function Thread(thunk) {
    this.thunk = thunk;
    this.isActive = false;
}

Thread.prototype.activate = function() {
    this.isActive = true;
    this.cont(this.cont);
}

function ThreadSystem() {
    this.threads = [];
}

ThreadSystem.prototype.spawn = function(thunk) {
    this.threads.push(new Thread(thunk));
};

ThreadSystem.prototype.quit = function() {
    this.threads.shift();
    if (this.threads.length > 0) {
        this.threads[0].activate();
    } else {
        this.halt();
    }
};

ThreadSystem.prototype.relinquish = function() {
    this.threads[0].isActive = false;
    this.threads[0].cont = Continuation.current()
    if (!this.threads[0].isActive) {
        this.threads.push(this.threads[0]);
        this.quit();
    }
};

ThreadSystem.prototype.start_threads = function() {
    this.threads.forEach(function(thread) {
        thread.cont = Continuation.current()
        if (thread.isActive) {
            thread.thunk();
        }
    });

    this.halt = Continuation.current()

    if (this.threads.length > 0) {
        this.threads[0].activate();
    }
};

function make_thread_system() {
    return new ThreadSystem();
}


// Counter example

var counter = 10;
function make_thread_thunk(name, thread_system) {
    function loop() {
        if (counter < 0) {
            thread_system.quit();
        }
        print('in thread',name,'; counter =',counter);
        counter--;
        thread_system.relinquish();
        loop();
    };
    return loop;
}
var thread_sys = make_thread_system();
thread_sys.spawn(make_thread_thunk('a', thread_sys));
thread_sys.spawn(make_thread_thunk('b', thread_sys));
thread_sys.spawn(make_thread_thunk('c', thread_sys));
thread_sys.start_threads();


