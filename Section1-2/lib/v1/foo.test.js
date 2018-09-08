const chai = require('chai');
const expect = chai.expect;

describe('chai test', () => {
    it('should comparte some values', () => {
        expect(1).to.equal(1);
    });

    it('should test some other stuff', () => {
        expect({ name: 'foo' }).to.deep.equal({ name: 'foo' });
        expect({ name: 'foo' }).to.have.property('name');
        expect(5 > 8).to.be.false;
        expect({}).to.be.a('object');
        expect('foo').to.be.a('string');
        expect(3).to.be.a('number');
        expect('foo').to.be.a('string').with.lengthOf(3);
        expect([1,2,3].length).to.equal(3);
        expect(undefined).to.not.exist;
        expect(null).to.be.null;
        expect(1).to.exist;
    });
});