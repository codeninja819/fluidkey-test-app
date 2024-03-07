import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Topbar() {
  return (
    <>
      <div className='w-screen flex justify-center'>
        <div className='flex justify-between container p-4'>
          <h1>Fluidkey Test App</h1>
          <ConnectButton />
        </div>
      </div>
    </>
  );
}
