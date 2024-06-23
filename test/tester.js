const { expect } = require('chai');
const { ethers, artifacts, waffle } = require('hardhat');
const { impersonateFundERC20 } = require('../utils/utilities');

const provider = waffle.provider;

describe('FlashSwap Contract', () => {
  let FLASHSWAP,
    BORROW_AMOUNT,
    FUND_AMOUNT,
    initiateFundHuman,
    txArbitrage,
    gasUsedUSD;

  const DECIMALS = 18;

  const BUSD_WHALE = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
  const BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
  const USDT = '0x55d398326f99059fF775485246999027B3197955';
  const CAKE = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
  const CROX = '0x2c094F5A7D1146BB93850f629501eB749f6Ed491';

  const BASE_TOKEN_ADDRESS = BUSD;

  let tokenBase;

  before(async () => {
    // Get the contract artifact
    const IERC20Artifact = await artifacts.readArtifact('IERC20');
    tokenBase = new ethers.Contract(
      BASE_TOKEN_ADDRESS,
      IERC20Artifact.abi,
      provider
    );

    // Impersonate the whale account
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [BUSD_WHALE],
    });

    whaleSigner = await ethers.getSigner(BUSD_WHALE);
  });

  beforeEach(async () => {
    // Get the owner as the signer
    [owner] = await ethers.getSigners();

    // Ensure the whale has a balance
    const whale_balance = await tokenBase.balanceOf(BUSD_WHALE);
    expect(whale_balance).to.be.gt(0);
  });

  it('general test', async () => {
    const whale_balance = await tokenBase.balanceOf(BUSD_WHALE);
    console.log(
      `Whale BUSD balance: ${ethers.utils.formatUnits(whale_balance, DECIMALS)}`
    );
  });

  after(async () => {
    // Stop impersonating the whale account
    await network.provider.request({
      method: 'hardhat_stopImpersonatingAccount',
      params: [BUSD_WHALE],
    });
  });
});
