import {
  extractViewingPrivateKeyNode,
  generateEphemeralPrivateKey,
  generateKeysFromSignature,
  generateStealthAddresses,
  predictStealthSafeAddressWithBytecode,
} from '@fluidkey/stealth-account-kit';
import { useEffect, useState } from 'react';
import {
  Address,
  HDKey,
  erc20Abi,
  formatEther,
  formatUnits,
  isAddress,
  zeroAddress,
} from 'viem';
import { useChainId, usePublicClient, useSignMessage } from 'wagmi';
import { SafeVersion } from '@fluidkey/stealth-account-kit/lib/predictStealthSafeAddressTypes';
import { privateKeyToAccount } from 'viem/accounts';
import { contracts } from '../contracts';
import CsvDownloader from 'react-csv-downloader';

type StealthSafeAccoount = {
  nonce: number;
  address: `0x${string}`;
  balance?: string;
  usdc?: string;
  usdt?: string;
  dai?: string;
  custom?: string;
};

export default function Main() {
  const currentChainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();

  const [spendingPublicKey, setSpendingPublicKey] = useState<string>('');
  const [viewingPrivateKey, setViewingPrivateKey] = useState<string>('');
  const [privateViewingKeyNode, setPrivateViewingKeyNode] = useState<
    HDKey | undefined
  >(undefined);
  const [results, setResults] = useState<StealthSafeAccoount[]>([]);

  const [secret, setSecret] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [safeVersion, setSafeVersion] = useState<SafeVersion>('1.3.0');
  const [useDefaultAddress, setUseDefaultAddress] = useState<boolean>(true);
  const [startNonce, setStartNonce] = useState<number>(0);
  const [endNonce, setEndNonce] = useState<number>(1);
  const [customToken, setCustomToken] = useState<Address>(zeroAddress);

  const [, setUpdate] = useState<boolean>(true);
  const forceUpdate = () => setUpdate((u) => !u);

  const generatePrivateKeys = async () => {
    const signature = await signMessageAsync({
      message: `Sign this message to generate your Fluidkey private payment keys.

WARNING: Only sign this message within a trusted website or platform to avoid loss of funds.
      
Secret: ${secret}`,
    });
    const { spendingPrivateKey, viewingPrivateKey } =
      generateKeysFromSignature(signature);
    setViewingPrivateKey(viewingPrivateKey);
    const privateViewingKeyNode = extractViewingPrivateKeyNode(
      viewingPrivateKey,
      0
    );
    const spendingAccount = privateKeyToAccount(spendingPrivateKey);
    const spendingPublicKey = spendingAccount.publicKey;
    setSpendingPublicKey(spendingPublicKey);
    setPrivateViewingKeyNode(privateViewingKeyNode);
    console.log('spendingPrivateKey :>> ', spendingPrivateKey);
    console.log('viewingPrivateKey :>> ', viewingPrivateKey);
    console.log('privateViewingKeyNode :>> ', privateViewingKeyNode);
  };

  const generateStealthAddress = async () => {
    const results: StealthSafeAccoount[] = [];

    for (let nonce = startNonce; nonce <= endNonce; nonce++) {
      const { ephemeralPrivateKey } = generateEphemeralPrivateKey({
        viewingPrivateKeyNode: privateViewingKeyNode!,
        nonce: BigInt(nonce),
        chainId,
      });

      const { stealthAddresses } = generateStealthAddresses({
        spendingPublicKeys: [spendingPublicKey],
        ephemeralPrivateKey,
      });

      const { stealthSafeAddress } = predictStealthSafeAddressWithBytecode({
        threshold: 1,
        stealthAddresses,
        safeVersion: '1.3.0',
        safeProxyBytecode:
          '0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564',
        useDefaultAddress: true,
      });

      results.push({
        nonce,
        address: stealthSafeAddress,
      });
    }
    setResults(results);
  };

  const fetchTokenBalance = async (
    address: Address,
    tokenAddress: Address | undefined
  ) => {
    if (
      !tokenAddress ||
      !isAddress(tokenAddress) ||
      tokenAddress == zeroAddress ||
      !publicClient
    ) {
      return 'N/A';
    }
    const tokenBalance = await publicClient.multicall({
      contracts: [
        {
          address: tokenAddress,
          functionName: 'decimals',
          abi: erc20Abi,
        },
        {
          address: tokenAddress,
          functionName: 'balanceOf',
          args: [address],
          abi: erc20Abi,
        },
      ],
    });
    if (tokenBalance[0].error) {
      console.log(tokenBalance[0].error);
      return 'N/A';
    }
    return formatUnits(
      tokenBalance[1].result || 0n,
      tokenBalance[0].result || 6
    );
  };

  const fetchBalance = async () => {
    if (!publicClient) return;
    console.log('fetchbalance');
    results.forEach(async (result, index) => {
      (async () => {
        const balance = await publicClient.getBalance({
          address: result.address || zeroAddress,
        });
        console.log('balance :>> ', balance);
        console.log('balance :>> ', balance);
        setResults((results) => {
          results[index].balance = formatEther(balance);
          return results;
        });
        forceUpdate();
      })();
      const { usdc, usdt, dai } = contracts[currentChainId];
      (async () => {
        const balance = await fetchTokenBalance(result.address, usdc);
        setResults((results) => {
          results[index].usdc = balance;
          return results;
        });
        forceUpdate();
      })();
      (async () => {
        const balance = await fetchTokenBalance(result.address, usdt);
        setResults((results) => {
          results[index].usdt = balance;
          return results;
        });
        forceUpdate();
      })();
      (async () => {
        const balance = await fetchTokenBalance(result.address, dai);
        setResults((results) => {
          results[index].dai = balance;
          return results;
        });
        forceUpdate();
      })();
      (async () => {
        const balance = await fetchTokenBalance(result.address, customToken);
        setResults((results) => {
          results[index].custom = balance;
          return results;
        });
        forceUpdate();
      })();
    });
  };
  useEffect(() => {
    fetchBalance();
  }, [currentChainId, results, customToken]);

  useEffect(() => {
    // TODO: fetch balances when new block is mined
  }, [chainId]);

  const columns = [
    {
      id: 'nonce',
      displayName: 'Nonce',
    },
    {
      id: 'address',
      displayName: 'Address',
    },
    {
      id: 'balance',
      displayName: 'ETH',
    },
    {
      id: 'usdc',
      displayName: 'USDC',
    },
    {
      id: 'usdt',
      displayName: 'USDT',
    },
    {
      id: 'dai',
      displayName: 'DAI',
    },
    {
      id: 'custom',
      displayName: 'CUSTOM',
    },
  ];

  return (
    <>
      <div className='w-full flex justify-center'>
        <div className='container p-4'>
          <div className='flex flex-col space-y-2'>
            <div className='flex justify-between'>
              <input
                type='text'
                placeholder='Secret'
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
              <button onClick={generatePrivateKeys}>
                Sign and generate private keys
              </button>
            </div>
            {viewingPrivateKey && (
              <>
                <div className='flex justify-between'>
                  <div className='flex space-x-4'>
                    <div className=''>Chain Id:</div>
                    <button onClick={() => setChainId(currentChainId)}>
                      Set as current network
                    </button>
                  </div>
                  <input
                    type='number'
                    value={chainId}
                    onChange={(e) => setChainId(+e.target.value)}
                  />
                </div>
                <div className='flex justify-between'>
                  <div>Safe Version:</div>
                  <select
                    value={safeVersion}
                    onChange={(e) =>
                      setSafeVersion(e.target.value as SafeVersion)
                    }
                  >
                    {['1.4.1', '1.3.0', '1.2.0', '1.1.1', '1.0.0'].map(
                      (version, index) => (
                        <option key={index} value={version}>
                          {version}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className='flex justify-between'>
                  <div>Use Default Address:</div>
                  <select
                    value={useDefaultAddress.toString()}
                    onChange={(e) => {
                      setUseDefaultAddress(e.target.value == 'true');
                    }}
                  >
                    <option value={'true'}>True</option>
                    <option value={'false'}>False</option>
                  </select>
                </div>
                <div className='flex justify-between'>
                  <div>Start Nonce:</div>
                  <input
                    type='number'
                    min={0}
                    value={startNonce}
                    onChange={(e) => {
                      setStartNonce(+e.target.value);
                      if (endNonce < +e.target.value)
                        setEndNonce(+e.target.value);
                    }}
                  />
                </div>
                <div className='flex justify-between'>
                  <div>End Nonce:</div>
                  <input
                    type='number'
                    value={endNonce}
                    min={startNonce}
                    onChange={(e) => setEndNonce(+e.target.value)}
                  />
                </div>
                <div className='flex justify-between'>
                  <div>Custom Token Address:</div>
                  <input
                    type='text'
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value as Address)}
                  />
                </div>
                <div className='flex justify-around'>
                  <button onClick={generateStealthAddress}>
                    Recover Addresses
                  </button>
                  <CsvDownloader
                    columns={columns}
                    datas={results as any}
                    filename='accounts.csv'
                  >
                    <button>Download as CSV</button>
                  </CsvDownloader>
                  ;
                </div>
                <table>
                  <tr>
                    <th>Nonce</th>
                    <th>Address</th>
                    <th>Native Currency</th>
                    <th>USDC</th>
                    <th>USDT</th>
                    <th>DAI</th>
                    <th>Custom Token</th>
                  </tr>
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td>{result.nonce}</td>
                      <td>{result.address}</td>
                      <td>{result.balance || 'Loading'}</td>
                      <td>{result.usdc || 'Loading'}</td>
                      <td>{result.usdt || 'Loading'}</td>
                      <td>{result.dai || 'Loading'}</td>
                      <td>{result.custom || 'Loading'}</td>
                    </tr>
                  ))}
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
