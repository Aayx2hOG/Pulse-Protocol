// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SentimentOracleIDL from '../target/idl/sentiment_oracle.json'
import type { SentimentOracle } from '../target/types/sentiment_oracle'

// Re-export the generated IDL and type
export { SentimentOracle, SentimentOracleIDL }

// The programId is imported from the program IDL.
export const SENTIMENT_ORACLE_PROGRAM_ID = new PublicKey(SentimentOracleIDL.address)

// This is a helper function to get the SentimentOracle Anchor program.
export function getSentimentOracleProgram(provider: AnchorProvider, address?: PublicKey): Program<SentimentOracle> {
  return new Program({ ...SentimentOracleIDL, address: address ? address.toBase58() : SentimentOracleIDL.address } as SentimentOracle, provider)
}

// This is a helper function to get the program ID for the SentimentOracle program depending on the cluster.
export function getSentimentOracleProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the SentimentOracle program on devnet and testnet.
      return new PublicKey('4Fxm3VkmLo76zuuvuAZYJhtWygDD427zwMpwnMGHHJA4')
    case 'mainnet-beta':
    default:
      return SENTIMENT_ORACLE_PROGRAM_ID
  }
}
