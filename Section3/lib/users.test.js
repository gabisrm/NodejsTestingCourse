const chai = require('chai');
const expect = chai.expect;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const rewire = require('rewire');


var mailer = require('./mailer');

var mongoose = require('mongoose');

var users = require('./users');
var User = require('./models/user');

var sandbox = sinon.sandbox.create();

describe('users', () => {
    let findStub;
    let sampleArgs;
    let deleteStub;
    let sampleUser;
    let mailerStub;

    beforeEach(() => {
        sampleUser = {
            id: 123,
            name: 'foo',
            email: 'foo@bar.com'
        }

        //el metodo 'findById' se encuentra en mongoose.model. Toda llamada a 'findById' resolverá en el usuario sampleUser
        findStub = sandbox.stub(mongoose.Model, 'findById').resolves(sampleUser);
        deleteStub = sandbox.stub(mongoose.Model, 'remove').resolves('fake_remove_result');
        mailerStub = sandbox.stub(mailer, 'sendWelcomeEmail').resolves('fake_email');
    });

    afterEach(() => {
        sandbox.restore();
        users = rewire('./users'); //al volver a instanciarlo, resetea todos los cambios hechos. SImilar a un sandbox.restore
    });

    context('get', () => {
        it('should check for an id', (done) => {
            users.get(null, (err, result) => {
                expect(err).to.exist;
                expect(err.message).to.equal('Invalid user id');
                done();
            })
        });

        //test de obtener un id valido
        it('should call findUserById with id and return result', (done) => {
            //restauramos para este ejemplo
            sandbox.restore();
            let stub = sandbox.stub(mongoose.Model, 'findById').yields(null, { name: 'foo' });

            users.get(123, (err, result) => {
                expect(err).to.not.exist;
                expect(stub).to.have.been.calledOnce;
                expect(stub).to.have.been.calledWith(123);
                expect(result).to.be.a('object');
                expect(result).to.have.property('name').to.equal('foo');

                done();
            })
        })

        //test de cuando peta la BBDD
        it('should catch error if there is one', (done) => {
            sandbox.restore();
            let stub = sandbox.stub(mongoose.Model, 'findById').yields(new Error('fake'));

            users.get(123, (err, result) => {
                expect(result).to.not.exist;
                expect(err).to.exist;
                expect(err).to.be.instanceOf(Error);
                expect(stub).to.have.been.calledWith(123);
                expect(err.message).to.equal('fake');

                done();
            })
        });
    });

    context('delete user', () => {
        it('should check for an id using return', () => {
            return users.delete().then(result => {
                //no deeria pasar dado que no se pasa id
                throw new Error('unexpected success');
            }).catch((err) => {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal('Invalid id')
            })
        });

        //este test es el mismo que el de arriba, pero más compacto! usado con chai as promised!
        it('should check for error using eventually', () => {
            return expect(users.delete()).to.eventually.be.rejectedWith('Invalid id');
        });

        //lo mismo tb con async/await
        it('should call User.remove', async () => {
            let result = await users.delete(123);

            expect(result).to.equal('fake_remove_result');
            expect(deleteStub).to.have.been.calledWith({ _id: 123 });
        });
    });

    context('crete user', () => {

        let FakeUserClass, saveStub, result;

        beforeEach(async () => {
            saveStub = sandbox.stub().resolves(sampleUser);
            FakeUserClass = sandbox.stub().returns({ save: saveStub }); //tengo que añadirle el stub 'save' a Users, porque la función, tras instanciar, llama a ese método de la clase

            users.__set__('User', FakeUserClass); //sustituyo la clase User por FakeUserClass
            result = await users.create(sampleUser);
        });

        it('should reject invalid args', async () => {

            await expect(users.create()).to.eventually.be.rejectedWith('Invalid arguments');
            await expect(users.create({ name: 'foo' })).to.eventually.be.rejectedWith('Invalid arguments');
            await expect(users.create({ email: 'foo@bar.com' })).to.eventually.be.rejectedWith('Invalid arguments');
        });

        it('should call User with new', () => {
            expect(FakeUserClass).to.have.been.calledWithNew;
            expect(FakeUserClass).to.have.been.calledWith(sampleUser);
        });

        it('should save the user', () => {
            expect(saveStub).to.have.been.called;
        });

        it('should call mailer with email and name', () => {
            expect(mailerStub).to.have.been.calledWith(sampleUser.email, sampleUser.name);
        });

        it('should reject errors',  async () => {
            saveStub.rejects(new Error('fake')); //cambia el comportamiento definido en beforeEach para que ahora rechace con el siguiente error

            await expect(users.create(sampleUser)).to.eventually.be.rejectedWith('fake');
        });
    });

});