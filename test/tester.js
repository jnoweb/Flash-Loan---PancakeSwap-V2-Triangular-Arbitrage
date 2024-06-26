const { expect, assert } = require('chai');
const { ethers, waffle } = require('hardhat');
const {
  abi,
} = require('../artifacts/contracts/interfaces/IERC20.sol/IERC20.json');
const { impersonateFundErc20 } = require('../utils/utilities');

const provider = waffle.provider;

describe('FlashSwap Contract', function () {
  let FLASHSWAP,
    BORROW_AMOUNT,
    FUND_AMOUNT,
    initialFundingHuman,
    txArbitrage,
    gasUsedUSD;

  const DECIMALS = 18;

  const BUSD_WHALE = '0xf977814e90da44bfa03b6295a0616a897441acec';
  const BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
  const USDT = '0x55d398326f99059fF775485246999027B3197955';
  const CAKE = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
  const CROX = '0x2c094F5A7D1146BB93850f629501eB749f6Ed491';

  const BASE_TOKEN_ADDRESS = BUSD;

  beforeEach(async function () {
    // Get owner as signer
    [owner] = await ethers.getSigners();

    // Initialize tokenBase contract
    tokenBase = new ethers.Contract(BASE_TOKEN_ADDRESS, abi, provider);

    // Ensure the whale has a balance
    const whale_balance = await tokenBase.balanceOf(BUSD_WHALE);
    expect(whale_balance).to.be.gt(0);

    // Deploy smart contract
    const FlashSwap = await ethers.getContractFactory('PancakeFlashSwap');
    FLASHSWAP = await FlashSwap.deploy();
    await FLASHSWAP.deployed();

    // Configure our borrowing
    const borrowAmountHuman = '1';
    BORROW_AMOUNT = ethers.utils.parseUnits(borrowAmountHuman, DECIMALS);

    // Configure funding - FOR TESTING ONLY
    initialFundingHuman = '100';
    FUND_AMOUNT = ethers.utils.parseUnits(initialFundingHuman, DECIMALS);

    // Fund our contract - FOR TESTING ONLY
    await impersonateFundErc20(
      tokenBase,
      BUSD_WHALE,
      FLASHSWAP.address,
      initialFundingHuman
    );
  });

  /* it('should print whale balance', async function () {
    const whale_balance = await tokenBase.balanceOf(BUSD_WHALE);
    console.log(ethers.utils.formatUnits(whale_balance.toString(), DECIMALS));
    expect(whale_balance).to.be.a('object');
  }); */

  describe('Arbitrage Execution', () => {
    it('ensure the contract is funded', async function () {
      const flashSwapBalance = await FLASHSWAP.getBalanceOfToken(
        BASE_TOKEN_ADDRESS
      );

      const flashSwapBalanceHuman = ethers.utils.formatUnits(
        flashSwapBalance,
        DECIMALS
      );

      // console.log(flashSwapBalanceHuman);

      expect(Number(flashSwapBalanceHuman)).equal(Number(initialFundingHuman));
    });

    it('executes the arbitrage', async () => {
      txArbitrage = await FLASHSWAP.startArbitrage(
        BASE_TOKEN_ADDRESS,
        BORROW_AMOUNT
      );

      assert(txArbitrage);

      // Print balances
      const contractBalanceBUSD = await FLASHSWAP.getBalanceOfToken(BUSD);
      const formattedBalBUSD = Number(
        ethers.utils.formatUnits(contractBalanceBUSD, DECIMALS)
      );
      console.log('Balance of BUSD: ' + formattedBalBUSD);
    });
  });
});
