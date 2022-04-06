const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.new("Cool Tokens", "CTK");

    assert.equal(await instance.name.call(), "Cool Tokens");
    assert.equal(await instance.symbol.call(), "CTK");
});

it('lets 2 users exchange stars', async() => {
    let tokenId = 6;
    let anotherTokenId = 7;
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];

    await instance.createStar('Awesome Star!', tokenId, {from: user1})
    await instance.createStar('Regular Star :|', anotherTokenId, {from: user2})

    assert.equal(await instance.ownerOf.call(tokenId), user1);
    assert.equal(await instance.ownerOf.call(anotherTokenId), user2);

    await instance.exchangeStars(tokenId, anotherTokenId, {from: user1});

    assert.equal(await instance.ownerOf.call(tokenId), user2);
    assert.equal(await instance.ownerOf.call(anotherTokenId), user1);
});

it('lets a user transfer a star', async() => {
    let tokenId = 8;
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];

    await instance.createStar('Transfer Star!', tokenId, {from: user1})

    assert.equal(await instance.ownerOf.call(tokenId), user1);

    await instance.transferStar(user2, tokenId, {from: user1});

    assert.equal(await instance.ownerOf.call(tokenId), user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    let tokenId = 17;
    let instance = await StarNotary.deployed();

    await instance.createStar('Twinkle Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId), 'Twinkle Star!')
});