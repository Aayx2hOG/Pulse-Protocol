'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { WalletButton } from '../solana/solana-provider'
import { useSentimentOracleProgram } from './basic-data-access'
import { AnalystRegistration, BasicProgram } from './basic-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function BasicFeature() {
  const { publicKey } = useWallet()
  const { programId } = useSentimentOracleProgram()

  return publicKey ? (
    <div>
      <AppHero title="Sentiment Oracle" subtitle={'Register as an analyst and submit your predictions.'}>
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <AnalystRegistration />
      </AppHero>
      <BasicProgram />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  )
}