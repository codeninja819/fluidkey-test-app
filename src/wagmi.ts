import {
  arbitrum,
  base,
  gnosis,
  goerli,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
  appName: 'FluidKey Test App',
  projectId: import.meta.env.VITE_WC_PROJECT_ID,
  chains: [mainnet, optimism, base, goerli, polygon, arbitrum, gnosis, sepolia],
  ssr: false,
});

export { config };
