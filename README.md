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

            Stub: es parecido a un spy. En realidad se podría realizxar el mismo test de antes con un stub:
                it('should stub console.warn', () => {
                    let stub = sinon.stub(console, 'warn');

                    demo.foo(); //al pasar console.warn como stub, no se llamará en demo.foo()!! se sustituirá la llamada por la del stub
                    expect(stub).to.have.been.calledOnce;
                });

            La diferencia es que en este caso, el stub hace que NO se llame a console.warn!! El stub sustituye esa función en el código por la suya.
            Con el stub se puede hacer que también haga llamadas cuando fuera invocado. Ej:
                let stub = sinon.stub(console, 'warn').callsFake(() => {console.log('message from stub')});
                let createStub = sinon.stub(demo, 'createFile').resolves('crete_stub');

            Esto es muy util por ejemplo para simular llamadas a BBDD => se haría un stub de esa llamada, y callsFake devolvería un objeto simulado, para simular coger un objeto de BBDD.

            Para stub también hay que hacerle un stub.restore() al final!!

            Se usan más stubs que spies.

    
        Por otro lado, sinon ofrece 'Sandboxes', que basicamente es un sandbox => Sandboxes removes the need to keep track of every fake created, which greatly simplifies cleanup. (https://sinonjs.org/releases/v2.0.0/sandbox/)

        Ej:
            var sinon = require('sinon');

            var myAPI = { myMethod: function () {} };
            var sandbox = sinon.sandbox.create();

            describe('myAPI.hello method', function () {

                beforeEach(function () {
                    // stub out the `hello` method
                    sandbox.stub(myApi, 'hello');
                });

                afterEach(function () {
                    // completely restore all fakes created through the sandbox
                    sandbox.restore();
                });

                it('should be called once', function () {
                    myAPI.hello();
                    sinon.assert.calledOnce(myAPI.hello);
                });

                it('should be called twice', function () {
                    myAPI.hello();
                    myAPI.hello();
                    sinon.assert.calledTwice(myAPI.hello);
                });
            });

    REWIRE:  (https://www.npmjs.com/package/rewire)
        Actúa como un require() al importar un módulo. Lo que lo diferencia es que rewire permite cambiar las variables privadas de ese módulo (por ejemplo urls en el módulo de BBDD). Ej, tengo el siguiente módulo que quiero testear:

            var fs = require("fs"),
            path = "/somewhere/on/the/disk";
        
        function readSomethingFromFileSystem(cb) {
            console.log("Reading from file system ...");
            fs.readFile(path, "utf8", cb);
        }
        
        exports.readSomethingFromFileSystem = readSomethingFromFileSystem;

        Solo la función es exportada; no tengo acceso a la variable path. En testeo por ejemplo me gustaría que el path fuera otro, para simular datos. Para eso se usa rewire => importo el módulo con rewire: 

            // test/myModule.test.js
            var rewire = require("rewire");

            var myModule = rewire("../lib/myModule.js");

        Rewire importará además un setter y getter especial para modificar las variables privadas de ese mḉodulo, por lo que se puede modificar la vaiable 'path' => 

            myModule.__set__("path", "/dev/null");
            myModule.__get__("path"); // = '/dev/null'

        Rewire me permitiría incluso cambiar del ejemplo anterior el módulo 'fs' => 

            var fsMock = {
                readFile: function (path, encoding, cb) {
                    expect(path).to.equal("/somewhere/on/the/disk");
                    cb(null, "Success!");
                }
            };
            myModule.__set__("fs", fsMock);
            
            myModule.readSomethingFromFileSystem(function (err, data) {
                console.log(data); // = Success!
            });

        De esta manera hemos mockeado el módulo fs que también era privado!!!


    SUPERTEST: para testear rutas/llamadas http

EJEMPLO DE PATRONES DE USO:

- Hacer un Stub a una creación de una instancia de una clase. 
    Ej: 

        exports.create = function (data) {
            if (!data || !data.email || !data.name) {
                return Promise.reject(new Error('Invalid arguments'));
            }

            var user = new User(data);

            return user.save().then((result) => {
                return mailer.sendWelcomeEmail(data.email, data.name).then(() => {
                    return {
                        message: 'User created',
                        userId: result.id
                    };
                });
            }).catch((err) => {
                return Promise.reject(err);
            });
        }

    Este método llama internamente a un new User(), además de otras cosas. Se quiere poder aislar la creación de la instancia del test en sí, ya que la creación de la instancia no pertenece al testeo de la función create().

    Para ello se usa rewire y sinon.stub(). Basicamente habría que usar rewire para sustituir la llamada a new User() por new FakeUser(), pero este FakeUser() debe tener un método save() que devuelva un resultado como mínimo. Dicho método se puede mockear con un stub() de sinon:


    beforeEach(() => {
        sampleUser = {
            id: 123,
            name: 'foo',
            email: 'foo@bar.com'
        }

        saveStub = sandbox.stub().resolves(sampleUser);
        FakeUserClass = sandbox.stub().returns({save: saveStub}); //tengo que añadirle el stub 'save' a Users, porque la función, tras instanciar, llama a ese método de la clase
    
        users.__set__('User', FakeUserClass); //sustituyo la clase User por FakeUserClass
        result = await users.create(sampleUser);
    });

    Por otro lado, la llamada a emailer se puede hacer un stub => mailerStub = sandbox.stub(mailer, 'sendWelcomeEmail').resolves('fake_email');

    Se puede testear que FakeUser se ha llamado con new así:
    expect(FakeUserClass).to.have.been.calledWithNew;




TEST de una clase:
    Si hay que hacer cosas complejas en el constructor (llamadas a BBDD/ al sistema de archivos...), se haría como cualquier otra función, haciendole un stub. Y chequeamos que el stub se ha llamado con los parámetros esperados





CODE COVERAGE:
    Cuanto códuigo se comprueba con nuestros unit tests. Uno de los frameworks más usados es istanbuljs/nyc:
        $ npm install --save-dev nyc

    Una vez instalado, creamos en el package.json un nuevo script:

        "script": {
            ...
            "coverage": "cross-env NODE_ENV=development nyc --reporter=text npm test"
            ...
        }

    Esto llamará a npm test y comprobará la cobertura. la llamada a $ npm run coverage, devolverá una gráfica que nos indicará por cada archivo, cuanto se ha cubierto. Además devuelve las líneas de código que no se han cubierto.

    EL coverage necesita que exista un archivo test por cada archivo de códuigo, ya que sino no contabiliza dicho archivo en el coverage!!!




SETUP:

    Setup de un archivo de testing:

        const chai = require('chai');
        const expect = chai.expect;

        const chaiAsPromised = require('chai-as-promised');
        chai.use(chaiAsPromised);
        const sinon = require('sinon');
        const sinonChai = require('sinon-chai');
        chai.use(sinonChai);

        const rewire = require('rewire');

        var sandbox = sinon.sandbox.create();


    Con estos módulos se puede realizar la mayoría de los testings


    OJO: el pattern para mocha a usar en npm test sería el siguiente:
        mocha \"./{,!(node_modules)/**/}*.test.js\"

        ya que asñi no coge los tests dentro de node_modules