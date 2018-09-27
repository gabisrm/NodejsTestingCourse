//no queremos usar el secret de la app.
//la llamada a crypto la queremos testear cada parte independientemente

const chai = require('chai');
const expect = chai.expect;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

var crypto = require('crypto');

var config = require('./config');
var utils = require('./utils');
var sandbox = sinon.sandbox.create();

describe('utils', () => {
    let secretStub, digestStub, updateStub, createHashStub, hash;

    beforeEach(() => {
        secretStub = sandbox.stub(config, 'secret').returns('fake_secret');
        digestStub = sandbox.stub().returns('ABC123');
        updateStub = sandbox.stub().returns({
            digest: digestStub
        });
        //de esta manera podemos encadenar update()
        createHashStub = sandbox.stub(crypto, 'createHash').returns({
            update: updateStub
        });

        hash = utils.getHash('foo');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return null if invalid stiring is passed', () => {
        sandbox.reset(); //esto es por si sandbox.restore() no funciona. En este ejemplo no funciona si no se hace esto

        let hash2 = utils.getHash(null);
        let hash3 = utils.getHash(123);
        let hash4 = utils.getHash({name: 'bar'});

        expect(hash2).to.be.null;
        expect(hash3).to.be.null;
        expect(hash4).to.be.null;
        
        expect(createHashStub).to.not.have.been.called;
    });

    it('should get secret from config', () => {
        expect(secretStub).to.have.been.called;
    });
    
    it('should call crypto wiith correct settings and return hash', () => {
        expect(createHashStub).to.have.been.calledWith('md5');
        expect(updateStub).to.have.been.calledWith('foo_fake_secret');
        expect(digestStub).to.have.been.calledWith('hex');
        expect(hash).to.equal('ABC123');
    });
});