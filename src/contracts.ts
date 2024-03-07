import { Address } from 'viem';

export interface Contracts {
  usdc?: Address;
  usdt?: Address;
  dai?: Address;
}

export const contracts: { [key: number]: Contracts } = {
  // mainnet
  1: {
    usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
  },
  // optimism
  10: {
    usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    usdt: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
  // base
  8453: {
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    dai: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  },
  // polygon
  137: {
    usdc: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    usdt: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    dai: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  // arbitrum
  42161: {
    usdc: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
  // gnosis
  100 : {
    usdc: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    usdt: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
    dai: '0x44fA8E6f47987339850636F88629646662444217',
  },
  // sepolia
  11155111: {
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    usdt: '0x7169d38820dfd117c3fa1f22a697dba58d90ba06',
    dai: '0x3e622317f8c93f7328350cf0b56d9ed4c620c5d6',
  },
};
