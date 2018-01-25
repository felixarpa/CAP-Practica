Continuation.callcc = function(aBlock) {
    return aBlock(new Continuation());
}

Continuation.current = function() {
    return Continuation.callcc((cc) => cc);
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
    var thread = new Thread(thunk)
    this.threads.push(thread);
    thread.cont = Continuation.current();
    if (thread.isActive) {
        thread.thunk();
    }
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
    this.threads[0].cont = Continuation.current();
    if (!this.threads[0].isActive) {
        this.threads.push(this.threads[0]);
        this.quit();
    }
};

ThreadSystem.prototype.start_threads = function() {
    this.halt = Continuation.current();

    if (this.threads.length > 0) {
        this.threads[0].activate();
    }
};

function make_thread_system() {
    return new ThreadSystem();
}


// Examples
var TAG;

// Counter example

print("\nCOUNTER");
TAG = "[LOOP]";

var counter = 10;
function make_thread_thunk(name, thread_system) {
    function loop() {
        if (counter < 0) {
            thread_system.quit();
        }
        print(TAG, "in thread", name, "; counter =", counter);
        counter--;
        thread_system.relinquish();
        loop();
    };
    return loop;
}
var counter_thread_sys = make_thread_system();
counter_thread_sys.spawn(make_thread_thunk('a', counter_thread_sys));
counter_thread_sys.spawn(make_thread_thunk('b', counter_thread_sys));
counter_thread_sys.spawn(make_thread_thunk('c', counter_thread_sys));
counter_thread_sys.start_threads();




