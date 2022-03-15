import { BigNumber, Contract, providers, utils } from 'ethers';
import Head from "next/head";
import React, { useEffect, useState, useRef } from "react"
import Web3Modal from "web3modal"
import styles from "../styles/Home.module.css"
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDR, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDR } from "../constants/index"

export default function Home() {
  // Create a bignumber `0`
  const zero = BigNumber.from(0)

  /** States */
  const [walletConnected, setWalletConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero)
  const [balanceOfWakulimaToken, setBalanceOfWakulimaToken] = useState(zero)
  const [tokenAmount, setTokenAmount] = useState(zero)
  const [tokensMinted, setTokensMinted] = useState(zero)

  // Create a reference to the web3Modal which persists as long as the page is open
  const web3ModalRef = useRef()


  /** 
   * @function getProviderOrSigner
   * @desc returns a provider or signer object representing the ETH rpc with or withour the signing capabilites of metamask attached
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to metamask
    const walletConnect = await web3ModalRef.current.connect()

    const provider = new providers.Web3Provider(walletConnect);

    // Check user's network. if not rinkeby, throw error
    const { chainId } = await provider.getNetwork()
    if (chainId !== 4) {
      window.alert("Change network to rinkeby")
      throw new Error("Change network to rinkeby")
    }

    if (needSigner) {
      const signer = provider.getSigner()
      return signer
    }

    return provider
  }


  /**
   * @function connectWallet
   * @desc Connects the metamask wallet
   */
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true)
    } catch (error) {
      console.error(error)
    }
  }


  /** Check balance of tokens that can be claimed by the user */
  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner()

      //create an NFT contract instance
      const nftContract = new Contract(
        NFT_CONTRACT_ADDR,
        NFT_CONTRACT_ABI,
        provider
      )

      // Create an instance of token instance
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        provider
      )

      const signer = await getProviderOrSigner(true)

      const wallet_addr = await signer.getAddress()

      const balance = await nftContract.balanceOf(wallet_addr);

      if (balance === zero) {
        setTokensToBeClaimed(zero)
      } else {
        let amount = 0;

        // For all the NFT's, check if the tokens have already been claimed, 
        // Only increase the amount if the tokens havae not been claimed for an NFT
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, 1)
          const claimed = await nftContract.tokenIdsClaimed(tokenId)
          if (!claimed) {
            amount++;
          }
        }

        setTokensToBeClaimed(BigNumber.from(amount))
      }
    } catch (error) {
      console.log('getTokensToBeClaimed ERr: ', error)
      setTokensToBeClaimed(zero)
    }
  }


  /** Check the balance of tokens held by an address */
  const getBalanceOfWakulimaToken = async () => {
    try {
      const provider = await getProviderOrSigner()

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        provider
      )

      const signer = await getProviderOrSigner(true)

      const wallet_addr = await signer.getAddress()

      const balance = await tokenContract.balanceOf(wallet_addr);

      setBalanceOfWakulimaToken(balance)

    } catch (error) {
      console.log('getBalanceOfWakulimaToken ERr: ', error)
      setBalanceOfWakulimaToken(zero)
    }
  }


  /** Retrieves how many tokens have been minted till now out of the total supply */
  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner()

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        provider
      )

      const _tokensMinted = await tokenContract.totalSupply()
      setTokensMinted(_tokensMinted)
    } catch (error) {
      console.log('getTotalTokensMinted ERr: ', error)
    }
  }


  /** mints a number of tokens to a given address */
  const mintWakulimaToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true)

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        signer
      )


      const value = 0.001 * amount

      // Value signifies the cost of one crypto asset which is 0.001. This si parsed to ether
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString())
      })

      setLoading(true)
      // Wait for tx to get minted
      await tx.wait()
      setLoading(false)

      window.alert("Successfully minted Wakulima token")

      await getBalanceOfWakulimaToken()
      await getTotalTokensMinted()
      await getTokensToBeClaimed()
    } catch (error) {
      console.log("mintWakulimaToken ERr: ", error)
    }

  }


  /** Allow use to claim wakulima tokens */
  const claimWakulimaTokens = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true)

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        signer
      )


      const value = 0.001 * amount

      // Value signifies the cost of one crypto asset which is 0.001. This si parsed to ether
      const tx = await tokenContract.claim()

      setLoading(true)
      // Wait for tx to get minted
      await tx.wait()
      setLoading(false)

      window.alert("Successfully claimed Wakulima token")

      await getBalanceOfWakulimaToken()
      await getTotalTokensMinted()
      await getTokensToBeClaimed()
    } catch (error) {
      console.log("mintWakulimaToken ERr: ", error)
    }

  }

  useEffect(() => {
    // Check if wallet is connect
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet();
      getTotalTokensMinted()
      getBalanceOfWakulimaToken()
      getTokensToBeClaimed()
    }
  }, [walletConnected])




  /** UI RENDER */
  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>loading ... </button>
        </div>
      )
    }

    if (tokensToBeClaimed > 0) {
      return (<div>
        <div className={styles.description}>
          {tokensToBeClaimed * 10} Tokens to be claimed
        </div>
        <button className={stles.button} onClick={claimWakulimaTokens}>Claim Tokens</button>
      </div>
      )
    }

    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder='Amount of tokens'
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintWakulimaToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    )
  }

  return (
    <div>
      <Head>
        <title>Wakulima</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Wakulima ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Wakulima tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfWakulimaToken)} Wakulima Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Wakulima
      </footer>
    </div>
  );
}