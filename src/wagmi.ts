import { mainnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet],
  ssr: false,
});

export { config };
