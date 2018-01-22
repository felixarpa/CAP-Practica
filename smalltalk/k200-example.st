"
Mateix codi que el de les transparencies de JavaScript (però en Smalltalk).
Pagina: 69.

function someFunction() {
    var kont = new Continuation();
    print('captured: ' + kont);
    return kont;
}
var k = someFunction();
if (k instanceof Continuation) {
    print('k is a continuation');
    k(200);
} else {
    print('k is now a ' + typeof(k));
}
print(k);
"
| someFunction k |

someFunction := [ 
    | kont |
    kont := Continuation continuation.
    Transcript show: 'captured: '.
    Transcript show: kont; cr.
    kont ].

k := someFunction value.

( k class = Continuation )
    ifTrue: [ 
        Transcript show: 'k is a continuation'; cr.
        k value: 200. ]
    ifFalse: [ 
        Transcript show: 'k is a '.
        Transcript show: k class; cr.
         ].

Transcript cr.
Transcript show: k; cr.

"
captured: a Continuation
k is a Continuation
captured: 200
k is a SmallInteger

200
"
