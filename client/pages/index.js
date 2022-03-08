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
}