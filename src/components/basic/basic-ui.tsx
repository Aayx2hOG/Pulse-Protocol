'use client'

import { useSentimentOracleProgram } from './basic-data-access'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function AnalystRegistration() {
  const { registerAnalyst, getAnalystAccount } = useSentimentOracleProgram()
  const [name, setName] = useState('')
  const [modelHash, setModelHash] = useState('')

  if (getAnalystAccount.data) {
    return (
      <div className="alert alert-success">
        <div>
            <h3 className="font-bold">Registered as Analyst</h3>
            <p>Name: {getAnalystAccount.data.name}</p>
            <p>Reputation: {getAnalystAccount.data.reputationScore}</p>
            <p>Model Hash: {getAnalystAccount.data.modelHash}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-xl p-4 space-y-4 max-w-md mx-auto">
        <h2 className="card-title justify-center">Register as Analyst</h2>
        <div className="form-control">
            <label className="label">
                <span className="label-text">Analyst Name</span>
            </label>
            <input 
                type="text" 
                placeholder="CryptoWizard" 
                className="input input-bordered" 
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </div>
        <div className="form-control">
            <label className="label">
                <span className="label-text">Model Hash / ID</span>
            </label>
            <input 
                type="text" 
                placeholder="Unique ID for your model" 
                className="input input-bordered" 
                value={modelHash}
                onChange={(e) => setModelHash(e.target.value)}
            />
        </div>
        <Button 
            onClick={() => registerAnalyst.mutateAsync({ name, modelHash })} 
            disabled={registerAnalyst.isPending || !name || !modelHash}
            className="btn btn-primary w-full"
        >
            {registerAnalyst.isPending ? 'Registering...' : 'Register'}
        </Button>
    </div>
  )
}

export function BasicProgram() {
  const { getProgramAccount } = useSentimentOracleProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
    </div>
  )
}