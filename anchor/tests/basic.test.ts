import * as anchor from '@coral-xyz/anchor'
import { SentimentOracle } from '../target/types/sentiment_oracle'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { before } from 'node:test'
import assert from 'assert'

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
  let betPda: PublicKey

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
    ;[betPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('bet'), Buffer.from(predictionId), admin.publicKey.toBuffer()],
      program.programId,
    )
  })

  describe('Initialize', () => {
    it('should initialize the oracle config', async () => {
      const tx = await program.methods.initialize().rpc()
      console.log('initialize tx', tx)

      const config = await program.account.oracleConfig.fetch(configPda)
      assert.strictEqual(config.admin.toString(), admin.publicKey.toString())
      assert.strictEqual(config.minStake.toNumber(), 100_000_000)
      assert.strictEqual(config.isPaused, false)
    })
  })

  describe('Register Analyst', () => {
    it('Should register a new analyst', async () => {
      const tx = await program.methods.registerAnalyst('TestAnalyst', 'model_hash_v1').rpc()
      console.log('register analyst tx', tx)

      const analyst = await program.account.analyst.fetch(analystPda)
      assert.strictEqual(analyst.name, 'TestAnalyst')
      assert.strictEqual(analyst.reputationScore, 500)
      assert.strictEqual(analyst.isActive, true)
    })
  })

  describe('Create a sentiment feed', () => {
    it('Should create a sentiment feed', async () => {
      const tx = await program.methods.createSentimentFeed('sol_sentiment', { cryptocurrency: {} }).rpc()
      console.log('create sentiment feed tx', tx)

      const feed = await program.account.sentimentFeed.fetch(feedPda)
      assert.strictEqual(feed.assetId, 'sol_sentiment')
      assert.strictEqual(feed.sentimentScore, 50)
      assert.strictEqual(feed.isActive, true)
    })
  })

  describe('Stake Tokens', () => {
    it('should stake tokens as an analyst', async () => {
      const vaultBalanceBefore = await provider.connection.getBalance(vaultPda)

      const tx = await program.methods
        .stakeTokens(new anchor.BN(100_000_000))
        .accountsPartial({
          vault: vaultPda,
        })
        .rpc()
      console.log('stake tokens tx', tx)

      const analyst = await program.account.analyst.fetch(analystPda)
      assert.strictEqual(analyst.stakeAmount.toNumber(), 100_000_000)

      const vaultBalanceAfter = await provider.connection.getBalance(vaultPda)
      assert.strictEqual(vaultBalanceAfter - vaultBalanceBefore, 100_000_000)
    })
  })

  describe('Unstake Tokens', () => {
    it('should stake more then unstake tokens', async () => {
      await program.methods
        .stakeTokens(new anchor.BN(100_000_000))
        .accountsPartial({ vault: vaultPda })
        .rpc()

      const analystBefore = await program.account.analyst.fetch(analystPda)
      const vaultBalanceBefore = await provider.connection.getBalance(vaultPda)

      const tx = await program.methods
        .unstakeTokens(new anchor.BN(100_000_000))
        .accountsPartial({ vault: vaultPda })
        .rpc()
      console.log('unstake tokens tx', tx)

      const analystAfter = await program.account.analyst.fetch(analystPda)
      assert.strictEqual(analystAfter.stakeAmount.toNumber(), analystBefore.stakeAmount.toNumber() - 100_000_000)

      const vaultBalanceAfter = await provider.connection.getBalance(vaultPda)
      assert.strictEqual(vaultBalanceBefore - vaultBalanceAfter, 100_000_000)
    })
  })

  describe('Submit sentiment', () => {
    it('should submit sentiment to a feed', async () => {
      const tx = await program.methods
        .submitSentiment(75, 85, 'reasoning_ipfs_hash', ['twitter', 'reddit'])
        .accountsPartial({
          sentimentFeed: feedPda,
        })
        .rpc()
      console.log('submit sentiment tx', tx)

      const feed = await program.account.sentimentFeed.fetch(feedPda)
      assert.ok(feed.dataPoints.toNumber() > 0)
    })
  })

  describe('Create Prediction', () => {
    it('should create a new prediction market', async () => {
      const deadline = Math.floor(Date.now() / 1000) + 2 // 2 seconds from now
      const tx = await program.methods
        .createPrediction(predictionId, 'SOL', { priceAbove: {} }, new anchor.BN(200_000_000), new anchor.BN(deadline))
        .rpc()
      console.log('create prediction tx', tx)

      const prediction = await program.account.prediction.fetch(predictionPda)
      assert.strictEqual(prediction.predictionId, predictionId)
      assert.strictEqual(prediction.targetAsset, 'SOL')
      assert.strictEqual(prediction.targetValue.toNumber(), 200_000_000)
      assert.strictEqual(prediction.yesStake.toNumber(), 0)
      assert.strictEqual(prediction.noStake.toNumber(), 0)
    })
  })

  describe('Place Bet', () => {
    it('should place a bet on a prediction', async () => {
      const vaultBalanceBefore = await provider.connection.getBalance(vaultPda)

      const tx = await program.methods
        .placeBet(new anchor.BN(50_000_000), true)
        .accountsPartial({
          prediction: predictionPda,
          vault: vaultPda,
        })
        .rpc()
      console.log('place bet tx', tx)

      const bet = await program.account.bet.fetch(betPda)
      assert.strictEqual(bet.amount.toNumber(), 50_000_000)
      assert.strictEqual(bet.position, true)
      assert.strictEqual(bet.claimed, false)

      const prediction = await program.account.prediction.fetch(predictionPda)
      assert.strictEqual(prediction.yesStake.toNumber(), 50_000_000)
      assert.strictEqual(prediction.totalParticipants, 1)

      const vaultBalanceAfter = await provider.connection.getBalance(vaultPda)
      assert.strictEqual(vaultBalanceAfter - vaultBalanceBefore, 50_000_000)
    })
  })

  describe('Resolve Prediction', () => {
    it('should resolve a prediction as YES', async () => {
      // Wait for deadline to pass
      console.log('Waiting for deadline to pass...')
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const tx = await program.methods
        .resolvePrediction(new anchor.BN(250_000_000), 'proof_hash_123')
        .accountsPartial({
          prediction: predictionPda,
        })
        .rpc()
      console.log('resolve prediction tx', tx)

      const prediction = await program.account.prediction.fetch(predictionPda)
      assert.deepStrictEqual(prediction.outcome, { yes: {} })
    })
  })

  describe('Claim Winnings', () => {
    it('should claim winnings after prediction resolved', async () => {
      const vaultBalanceBefore = await provider.connection.getBalance(vaultPda)
      console.log('Vault balance before claim:', vaultBalanceBefore)

      try {
        const tx = await program.methods
          .claimWinnings()
          .accountsPartial({
            prediction: predictionPda,
            bet: betPda,
            vault: vaultPda,
          })
          .rpc()
        console.log('claim winnings tx', tx)

        const bet = await program.account.bet.fetch(betPda)
        assert.strictEqual(bet.claimed, true)

        const vaultBalanceAfter = await provider.connection.getBalance(vaultPda)
        assert.ok(vaultBalanceBefore - vaultBalanceAfter > 0)
        console.log('Payout received:', (vaultBalanceBefore - vaultBalanceAfter) / LAMPORTS_PER_SOL, 'SOL')
      } catch (error: any) {
        console.error('Claim winnings error:', error.message)
        throw error
      }
    })

    it('should fail to claim winnings twice', async () => {
      try {
        await program.methods
          .claimWinnings()
          .accountsPartial({
            prediction: predictionPda,
            bet: betPda,
            vault: vaultPda,
          })
          .rpc()
        assert.fail('Should have thrown an error')
      } catch (error: any) {
        console.log('Expected error:', error.message)
        assert.ok(error.message.includes('AlreadyClaimed') || error.message.includes('already'))
      }
    })
  })

  describe('Pause Oracle', () => {
    it('should pause the oracle', async () => {
      const tx = await program.methods.pauseOracle(true).rpc()
      console.log('pause oracle tx', tx)

      const config = await program.account.oracleConfig.fetch(configPda)
      assert.strictEqual(config.isPaused, true)
    })

    it('should unpause the oracle', async () => {
      const tx = await program.methods.pauseOracle(false).rpc()
      console.log('unpause oracle tx', tx)

      const config = await program.account.oracleConfig.fetch(configPda)
      assert.strictEqual(config.isPaused, false)
    })
  })

  describe('Admin Functions', () => {
    it('should update min stake', async () => {
      const newMinStake = new anchor.BN(50_000_000);

      const tx = await program.methods.updateMinStake(newMinStake).accountsPartial({
        config: configPda
      }).rpc();
      console.log('update min stake to', tx);

      const config = await program.account.oracleConfig.fetch(configPda);
      assert.strictEqual(config.minStake.toNumber(), 50_000_000);
    })

    it('should update cooldown', async() => {
      const newCooldown = new anchor.BN(30);

      const tx = await program.methods.updateCooldown(newCooldown).accountsPartial({
        config: configPda
      }).rpc();
      console.log('update cooldown to', tx);

      const config = await program.account.oracleConfig.fetch(configPda);
      assert.strictEqual(config.submissionCooldown.toNumber(), newCooldown.toNumber());
    })

    it('should update treasury', async () => {
    const newTreasury = anchor.web3.Keypair.generate().publicKey
    
    const tx = await program.methods
      .updateTreasury(newTreasury)
      .accountsPartial({
        config: configPda,
      })
      .rpc()
      console.log('update treasury tx', tx)
      const config = await program.account.oracleConfig.fetch(configPda)
      assert.strictEqual(config.treasury.toBase58(), newTreasury.toBase58())
    })

    it('should deactivate analyst', async () => {
      const tx = await program.methods
        .deactivateAnalyst(false)
        .accountsPartial({
          config: configPda,
          analyst: analystPda,
        })
        .rpc()
      console.log('deactivate analyst tx', tx)
      const analyst = await program.account.analyst.fetch(analystPda)
      assert.strictEqual(analyst.isActive, false)
      await program.methods
        .deactivateAnalyst(true)
        .accountsPartial({
          config: configPda,
          analyst: analystPda,
        })
        .rpc()
    })
  })
})
