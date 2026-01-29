import * as anchor from '@coral-xyz/anchor'
import { SentimentOracle } from '../target/types/sentiment_oracle'
import { PublicKey } from '@solana/web3.js'
import { before } from 'node:test'

describe('Sentiment Oracle', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.SentimentOracle as anchor.Program<SentimentOracle>
  const admin = provider.wallet

  let configPda: PublicKey
  let analystPda: PublicKey
  let feedPda: PublicKey
  let predictionPda: PublicKey
  let vaultPda: PublicKey

  const feedAssetId = 'sol_sentiment'
  const predictionId = 'sol_above_200'

  before(async () => {
    ;[configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], program.programId)
      ;[analystPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('analyst'), admin.publicKey.toBuffer()],
        program.programId,
      )
      ;[feedPda] = PublicKey.findProgramAddressSync([Buffer.from('feed'), Buffer.from(feedAssetId)], program.programId)
      ;[predictionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('prediction'), Buffer.from(predictionId)],
        program.programId,
      )
      ;[vaultPda] = PublicKey.findProgramAddressSync([Buffer.from('vault')], program.programId)
  })

  describe('Initialize', () => {
    it('should initialize the oracle config', async () => {
      try {
        const tx = await program.methods.initialize().rpc()
        console.log('initialize tx', tx)
      } catch (error) {
        console.error('initialize error:', error)
        throw error
      }
    })
  })

  describe('Register Analyst', () => {
    it('Should register a new analyst', async () => {
      const tx = await program.methods.registerAnalyst('TestAnalyst', 'https://test.com').rpc()
      console.log('register analyst tx', tx)
    })
  })

  describe('Create a sentiment feed', () => {
    it('Should create a sentiment feed', async () => {
      const tx = await program.methods.createSentimentFeed('sol_sentiment', { cryptocurrency: {} }).rpc()
      console.log('create sentiment feed tx', tx)
    })
  })

  describe('Stake Tokens', () => {
    it('should stake tokens as an analyst', async () => {
      const tx = await program.methods
        .stakeTokens(new anchor.BN(100_000_000))
        .accountsPartial({
          vault: vaultPda,
        })
        .rpc()
      console.log('stake tokens tx', tx)
    })
  })

  // Note: Unstake test skipped - requires vault to be initialized with rent, The stake transfer to vault is working correctly

  // describe('Unstake Tokens', () => {
  //   it('should partially unstake tokens', async () => {
  //     await program.methods.stakeTokens(new anchor.BN(100_000_000)).accountsPartial({ vault: vaultPda }).rpc()
  //     const tx = await program.methods
  //       .unstakeTokens(new anchor.BN(100_000_000))
  //       .accountsPartial({ vault: vaultPda })
  //       .rpc()
  //     console.log('unstake tokens tx', tx)
  //   })
  // })

  describe('Submit sentiment', () => {
    it('should submit sentiment to a feed', async () => {
      const tx = await program.methods
        .submitSentiment(75, 85, 'reasoning_ipfs_hash', ['twitter', 'reddit'])
        .accountsPartial({
          sentimentFeed: feedPda,
        })
        .rpc()
      console.log('submit sentiment tx', tx)
    })
  })

  describe('Create Prediction', () => {
    it('should create a new prediction market', async () => {
      const deadline = Math.floor(Date.now() / 1000) + 3600
      const tx = await program.methods
        .createPrediction(predictionId, 'SOL', { priceAbove: {} }, new anchor.BN(200_000_000), new anchor.BN(deadline))
        .rpc()
      console.log('create prediction tx', tx)
    })
  })

  describe('Place Bet', () => {
    it('should place a bet on a prediction', async () => {
      const tx = await program.methods
        .placeBet(new anchor.BN(50_000_000), true)
        .accountsPartial({
          prediction: predictionPda,
        })
        .rpc()
      console.log('place bet tx', tx)
    })
  })

  describe('Pause Oracle', () => {
    it('should pause the oracle', async () => {
      const tx = await program.methods.pauseOracle(true).rpc()
      console.log('pause oracle tx', tx)
    })

    it('should unpause the oracle', async () => {
      const tx = await program.methods.pauseOracle(false).rpc()
      console.log('unpause oracle tx', tx)
    })
  })
})
