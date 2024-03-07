import Topbar from './components/Topbar';
import Main from './components/Main';
import { useAccount } from 'wagmi';

function App() {
  const { isConnected } = useAccount();
  return (
    <>
      <div className='w-screen min-h-screen'>
        <Topbar />
        {isConnected && <Main />}
      </div>
    </>
  );
}

export default App;
