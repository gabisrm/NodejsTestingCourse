NOTAS

UNIT-TESTING:

    Lo fundamental del unit testing es AISLAR EL CÓDIGO QUE SE ESTÁ TESTEANDO! Ejemplo: función que guarda algo en BBDD. En realidad haría un stub que simulara la llamada a BBDD. Lo que yo testearía es que se ha hecho la llamada a BBDD desde la función.

En nodejs, el framework más popular de testing es Mocha.


MOCHA:

BLOQUES QUE ENGLOBAN TESTS:
    bloque 'describe' => engloba al módulo/archivo
    bloque 'context' => engloba a la función que se va a testear. En teoría ambos (describe/context) hacen lo mismo, pero por convenio se usan así.
    bloque 'it' => define un test en la función definida por el context

BLOQUES QUE ENGLOBAN ACCIONES ANTES/DESPUES DE TEST:

    before => Ejecuta el código en su callback antes del inicio del bloque en el que se encuentra (init)
    after => igual que before, pero se ejecuta después (cleanUp)
    beforeEach => se ejecuta antes de cada elemento contenido en el bloque
    afterEach => igual que beforeEach, pero se ejecuta después

    beforeEach y afterEach no se ejecuta sobre un pending test




Pending tests:
    - se generan con un bloque 'it' sin el segundo arghumento de entrada. Es como definir antes los test, si la función no está hecha (o terminada), y dejar un test pendiente. metodología TDD


Tests con funciones asíncronas:
    CALLBACKS:
        Las funciones asíncronas (con callbacks, llamadas a bbdd, promesas...), deben notificar cuando terminan. Para eso, el callback del bloque 'it' devuelve un callback a su vez, 'done', que se llamará cuando termine el test. Ej:
            it('should test the callback', (done) => {
                    demo.addCallback(1,2, (err, result) => {
                        expect(err).to.not.exist;
                        expect(result).to.equal(3);
                        done();
                    })
                });
        

    PROMSESAS:
        it('should add with a promise cb', (done) => {
            demo.addPromise(1,2).then((res) => {
                expect(result).to.equal(3);
                done();
            })
            .catch((err) => {
                console.log("ERROR");
                done(err);
            })
        });

        cuando se le pasa un error a done(), Mocha quiere que sea una instancia de tipo Error. Por lo que el código sería:
            exports.addPromise = function (a, b) {
                return Promise.reject(new Error("Error"));
            }

        Para testear una promesa, aparte del método de antes con el callback done(), se puede devolver directamente la promesa en el bloque it() =>

            it('should test a promise with return', () => {
                return demo.addPromise(1,2).then((result) => {
                    expect(result).to.equal(3);
                })
            });

            De esta manera también cazará el error, sin necesidad de poner el catch(). No hay que usar done().

        Para testear promesas consecutivas se podría usar el await:

        it('should test promise with async/await', () => {
                let result = await demo.addPromise(1,2);

                expect(result).to.equal(3);
            });

    Hay una última manera de testear funciones asíncronas:
    Con el plugin 'chai-as-promised'  (http://www.chaijs.com/plugins/chai-as-promised/)

    Para usarlo:
        const chai = require('chai');
        const expect = chai.expect;

        const chaiAsPromised = require('chai-as-promised');
        chai.use(chaiAsPromised);

            ...
        
        it('should test promise with chai as promised', async () => {
            await expect(demo.addPromise(1,2)).to.eventually.equal(3);
        });


METODOLOGÍA:
    Se tendrán multiples bloques 'context', uno para cada función, en los cuales se podrá hacer los before() y after().
    Rutas de los test: 
        1) En un proyecto, se tendrá una carpeta 'test' en el root (mismo nivel que el package.lock). Esa carpeta erá un espejo de las carpetas de código.
            Para ejecutar mocha sobre los archivos recursivamente:
                $ mocha ./test --recursive

                Esto ejecutará tests en todos los archivos dentro de ./test de manera recursiva

        2) otra metodología es guardar el archivo de test en el mismo sitio que el archivo que se testea. Es menos común pero evita problemas. Por ejemplo si muevo o renombro carpetas de los archivos de código tendría que hacer lo mismo en la de test si sigo la metodología anterior. Normalmente se pone como nombreFichero.test.js

        Para ejecutar todos los tests con una distribución similar hacemos:
            $ mocha './lib/**/*.test.js'

            Hay que ponerlo entre comillas, porque sino no pilla los tests anidados

        
        Para ejecutar los tests a través de npm, ponemos dicho comando en script.test. De esa manera al hacer $ npm test, ejecutará dicho comando.
        Se pueden haer múltiples comandos así, y diferenciar los tests que hago



LIBRERIAS ADICIONALES:

    ASSERT (CHAI):
    Hay una librería interna de assert de nodejs, pero le falta versatilidad. La que más se usa es 'chai', que tiene 3 interfaces:
        - should
        - expect (la más natural de usar, la que se usa en el curso)
        - assert


    CHAI-EXPECT:
    NOTA: se pueden encadenar casi todas las combinaciones!!!

        - expect(val1).to.equal(val2) : val1 y val2 son LITERALES. Para comparar objetos (punteros), se usa deepEqual.
            Ej de uso: para calcular longitud de arrays:
                expect([1,2,3].length).to.equal(3);

        - expect(obj1).to.deep.equal(obj2): compara los punteros obj1 y obj2 (compara TODAS las propiedades)
        - expect(obj).to.have.property(prop): comprueba que obj1 contenga la propiedad 'prop' . 
                encadenamientos comunes:
                    expect(obj).to.have.property(prop).to.equal(val): ademas comprueba que 'prop' tenga el valor 'val'
        - expect(expr).to.be.false: comprueba que la expresión interna booleana sea falsa
        - expect({}).to.be.a('object'): así es como se comprueba el tipo de una variable!!!
                encadenamientos comunes:
                    expect('foo').to.be.a('string').with.lengthOf(3);
        - expect(null).to.be.null => comprueba si es null
        - expect(undefined).to.not.exist => que no exista
        - expect(val).to.exist => comprueba que existe. Se usa mucho cuando no se sabe el valor exacto, pero se quiere comprobar que exista (ej: un timestamp)


    CROSS-ENV:
        Módulo para manejar las variables de entorno independientemente de la plataforma en la que se use. Ejemplo de uso:
            En el package.json, en scripts.tests podemos poner:
                "cross-env NODE_ENV=development mocha './lib/**/*.test.js'"

                en el código podré obtener la variable de entorno con: process.env.NODE_ENV

                Normalmente se usa para distinguir entre modo desarrollo y development (URLS, endpoints, etc). Y habrá ifs que sean tipo
                if(process.env.NODE_ENV === 'development'){
                    //configuración development
                } else if(process.env.NODE_ENV === 'production'){
                    //configuracion production
                }

                ES MUY IMPORTANTE, porque en el testing, muchas veces se borran datos de BBDD. Hacerlo con la BBDD de producción eliminaría TODO!

                
    SINON
        Es una librería para utilzar 'test doubles' (stubs, mocks, spies, dummies, fakes..) (más info en https://gaboesquivel.com/blog/2014/unit-testing-mocks-stubs-and-spies/)

        Cosas que hay:
            Dummies: Dummy objects are passed around but never actually used. Usually they are just used to fill parameter lists. It is an object that simply implements an Interface, and does nothing else. It’s not intended to be used in your tests and will have no effect on the behaviour, sometimes a null object could be sufficient. An example would be passing an object into a constructor that isn’t used in the path you’re taking, or a simple object to add to a collection. Ejemplo de uso de dummies:

                var TaskManager = function(){
                var taskList = [];

                    return {
                        addTask: function(task){
                            taskList.push(task);
                        },
                        tasksCount: function(){
                            return taskList.length;
                        }
                    }
                }

                // Test
                var assert = require("assert")
                describe('add task', function(){
                    it('should keep track of the number of tasks', function(){
                    var DummyTask = function(){ return {} };
                    var taskManager = new TaskManager();

                    taskManager.addTask(new DummyTask());
                    taskManager.addTask(new DummyTask());

                    assert.equal( taskManager.tasksCount(), 2 );

                    })
                })


            Spies: A test spy is an object that records its interaction with other objects throughout the code base. When deciding if a test was successful based on the state of available objects alone is not sufficient, we can use test spies and make assertions on things such as the number of calls, arguments passed to specific functions, return values and more.

            Test spies are useful to test both callbacks and how certain functions/methods are used throughout the system under test. The following simplified example shows how to use spies to test how a function handles a callback:
               
                "test should call subscribers on publish": function () {
                    var callback = sinon.spy();
                    PubSub.subscribe("message", callback)
                    PubSub.publishSync("message");

                    assertTrue(callback.called);
                }


            Stubs: Test stubs are fake objects with pre-programmed behavior ( Simulation of behaviour from other units ), Most of times they are simply returning fixed values. They are typically used for one of two reasons:
                - To avoid some inconvenient interface - for instance to avoid making actual requests to a server from tests.
                - To feed the system with known data, forcing a specific code path.
            Javascript is flexible enough to accomplish this easily without any library. Ej:
                "example of simple stub without any lib": function () {
                    var task = { completed = true }
                }


            Fakes: Fake objects have working implementations, but usually take some shortcut which makes them not suitable for production (an in memory database is a good example). The simplest way to think of a Fake is as a step up from a Stub. This means not only does it return values, but it also works just as a real Collaborator would. Ej:

            var xhr, requests;

            before(function () {
                xhr = sinon.useFakeXMLHttpRequest();
                requests = [];
                xhr.onCreate = function (req) { requests.push(req); };
            });

            after(function () {
                // we must clean up when tampering with globals.
                xhr.restore();
            });

            it("makes a GET request for todo items", function () {
                getTodos(42, sinon.spy());

                assert.equals(requests.length, 1);
                assert.match(requests[0].url, "/todo/42/items");
            });


            Mocks: When most people talk about Mocks what they are actually referring to are Test Doubles. A Test Double is simply another object that conforms to the interface of the required Collaborator, and can be passed in its place. There are very few classes that operate entirely in isolation. Usually they need other classes or objects in order to function, whether injected via the constructor or passed in as method parameters. These are known as Collaborators or Depencies.


        Como instalar sinon.js:
            $ npm install --save-dev sinon

        Como usar:
            Spies:
                let spy = sinon.spy(lib <Object>, function <String>)

            Donde 'lib' es la librería en la que quiero espiar, y function es la función en sí que quier espiar. Ej:
                it('should spy on log', () => {
                    let spy = sinon.spy(console, 'log');

                    demo.foo(); //demo.foo() llama internamente a console.log() una vez

                    expect(spy.calledOnce).to.be.true;
                });

            Una vez que se usa un spy, hay que hacerle un spy.restore(), ya que reseteará los contadores

            chai tiene plugins para sinon:
                $ npm install --save-dev sinon-chai

            Se usaria de esta manera (mismo ejemplo de arriba):
                const sinonChai = require('sinon-chai');
                chai.use(sinonChai);

                    ....
                    expect(spy).to.have.been.calledOnce;