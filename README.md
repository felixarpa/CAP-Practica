# Thread System

> **Fèlix Arribas Pardo** i **Carlota Catot Bragós**

Per dur a terme la pràctica, el que vam començar fent va ser escriure i entendre bé que feia cada una de les funcions que es necessitaven:

#### Spawn

Aquesta funció, inicialment sembla senzilla i així va ser fins a gairebé al final. Simplement calia afegir un nou thread (amb un thunk) a la llista de threads del sistema `ThreadSystem`.

#### Start threads

Aquí només s'inicia l'execució de tots el threads.

#### Relinquish

Des d'un principi sabíem que hauríem d'utilitzar continuacions: Havíem d'"aturar" l'execució del Thread actual i continuar la del següent.

#### Quit

Finalment, en aquesta funció d'alguna manera (pista: Halt) havia d'acabar amb l'execució del thread i treure'l de la llista de threads.

## Esquelet inicial

Vam veure clar que calia una cua d'execució. Hem utilitzat un simple *array*. Inicialitzant-lo buit `this.threads = []`, fent `this.threads.push(thread)` per afegir un nou thread i `this.threads.shift()` per eliminar el primer (*pop*).

## While True

Després d'un parell de dies donant-li voltes, l'exemple de *while true* amb continuacions ens va fer veure la solució. En el *while true*, creem una continuació amb `callcc` que retorna el paràmetre que li passes:

```smalltalk
cont := Continuation callcc: [ :cc | cc ].
```

```javascript
var cont = Continuation.callcc(function(cc) {
    return cc;
});
```

A aquesta continuació, l'avaluàvem amb ella mateixa (una continuació), i per tant tornàvem on l'havíem inicialitzat però valent el mateix.

Així doncs, si controlem on es crea la continuació i on l'avaluàvem, podem controlar quin codi o thunk s'executa.

El problema és que després de la creació de la continuació s'executa el mateix codi... Ho podem evitar amb un booleà que ens indiqui si el thread està actiu o no.

Així doncs, un thread contarà de tres elements bàsics:

- thunk: Codi que executarà
- isActive: Booleà que ens indica si és el thread actiu o no
- cont: Continuació que ens permetrà restaurar l'execució

### [Primera versió](https://github.com/felixarpa/CAP-Practica/commit/965728a7940df532bc7c4a87e970bf214e8c7575)

#### Spawn

```javascript
var thread = {};
thread.thunk = thunk;
thread.isActive = false;
this.threads.push(thread);
```

A l'afegir un nou thread, aquest no està actiu, tampoc inicialitzem la continuació fins que no cridem `ThreadSystem.start_threads`. No volem que comenci l'execució.

#### Start threads

A l'hora de començar tots els threads activem tots amb un `forEach`, si no està activat, no fa res, en canvi, si està activat, comença l'execució del *thunk*. Clarament al principi de tot cap dels threads començarà el thunk, però a mesura que els anem activant en el `relinquish` aniran entrant al *thunk*.

També inicialitzem la continuació `halt`, unica per tot el sistema, per sortir quan ja no hi ha més threads per executar. S'utilitza al `quit`.

```javasript
this.threads.forEach(function(thread) {
    // init thread.cont
});

this.halt = Continuation.callcc(function(cc) { return cc });

// execute first thread, if exists
if (this.threads.length > 0) {
    this.threads[0].isActive = true;
    this.threads[0].cont(this.threads[0].cont);
}
```

#### Relinquish

Primer de tot desactivem el thread, perquè no hi hagi problemes no bucles infinits. Tot seguit assignem la nova continuació i, finalment, posem el thread al final de la cua i "sortim".

```javascript
this.threads[0].isActive = false;
this.threads[0].cont = Continuation.callcc(function(cc) { return cc; });
if (!this.threads[0].isActive) {
    // push and quit threads[0]
}
```

El `if (!isActive)` sembla inútil perquè dues línies amunt l'hem fet `false`, però en realitat és molt important: Quan avaluem un altre cop la continuació, `isActive` serà cert i no entrarà al `if`, sortirà del 'relinquish' i continuarà l'execució del *thunk*.

#### Quit

Llegint el codi podem entendre fàcilment que fa: Elimina el primer thread (el que ha cridat `quit`) i, si hi ha algun thread a la cua, l'activem i avaluem la seva continuació, si no, anem a la continuació `halt` que havíem creat a l'inici de tot.

```javascript
this.threads.shift();
if (this.threads.length > 0) {
    this.threads[0].isActive = true;
    this.threads[0].cont(this.threads[0].cont);
} else {
    this.halt();
}
```

### [Segona versió](https://github.com/felixarpa/CAP-Practica/commit/b7870dd1222913da324d98d9f6d950b5e91ee601)

Amb la versió inicial l'exemple del comptador funciona, però codi ens semblava massa lleig i vam decidir crear una segona versió amb l'objecte `Thread` i el mètode `Thread.prototype.activate` entre altres petites millores.

```javascript
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
```

### Exemple fibonacci

L'exemple de Fibonacci és una barreja entre el memorizer i l'algoritme del n-èssim Fibonacci recursiu:

```javascript
var fibs = [];
function make_fib_thunk(n, thread_system) {
    function nFib() {
        if (n <= 1) {
            fibs[0] = 0;
            fibs[1] = 1;
            thread_system.quit();
        } else {
            thread_system.spawn(make_fib_thunk(n - 1, thread_system));
            while (fibs[n - 1] === undefined || fibs[n - 2] === undefined) {
                thread_system.relinquish();
            }
            fibs[n] = fibs[n - 1] + fibs[n - 2];
            thread_system.quit();
        }
    };
    return nFib;
}

var fib_thread_sys = make_thread_system();
fib_thread_sys.spawn(make_fib_thunk(9, fib_thread_sys));
fib_thread_sys.start_threads();
```

Aquest codi crea un nou thread per calcular el número de Fibonacci anterior si no és un cas base. Així doncs, es crida `spawn` un cop havent fet `start_threads`. Quin problema hi ha?

Spawn només afegeix el thread a la cua, però aquests inicialitzen la seva continuació en el `forAll` de `start_threads`.

### [Tercera versió](https://github.com/felixarpa/CAP-Practica/commit/9ab53d9de0f0304d5c4dd1c018697b07858ed579)

En aquesta versió hem mogut el codi d'inicialització de la continuació i l'execució inicial del thunk del `forAll` al mètode `spawn`:

```javascript
var thread = new Thread(thunk)
this.threads.push(thread);
thread.cont = Continuation.current();
if (thread.isActive) {
    thread.thunk();
}
```

Ara ja podem executar l'exemple de Fibonacci sense cap bucle infinit ni cap error en intentar avaluar `cont` a un thread que no l'havia inicialitzat.