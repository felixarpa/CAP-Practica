function someFunction() {
    return new Continuation(); // context de la l. 5
}

var x = someFunction(); // var x = []

if (!(x instanceof Continuation)) {
    print(x);
    print("és la lletra f");
} else {
    print(x);
    x('f');
}

/*
[object Continuation]
f
és la lletra f
*/