'use client'

import { getSentimentOracleProgram, getSentimentOracleProgramId } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

export function useSentimentOracleProgram() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSentimentOracleProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getSentimentOracleProgram(provider, programId), [provider, programId])

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const analystPda = useMemo(() => {
    if (!publicKey) return null
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('analyst'), publicKey.toBuffer()], programId)
    return pda
  }, [publicKey, programId])

  const getAnalystAccount = useQuery({
    queryKey: ['analyst', { cluster, analystPda }],
    queryFn: () => program.account.analyst.fetch(analystPda!),
    enabled: !!analystPda,
  })

  const registerAnalyst = useMutation({
    mutationKey: ['sentiment-oracle', 'register-analyst', { cluster }],
    mutationFn: async ({ name, modelHash }: { name: string; modelHash: string }) => {
      return program.methods.registerAnalyst(name, modelHash).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      getAnalystAccount.refetch()
    },
    onError: (error) => {
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    },
  })

  return {
    program,
    programId,
    getProgramAccount,
    getAnalystAccount,
    registerAnalyst,
  }
}
