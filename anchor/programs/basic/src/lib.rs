use anchor_lang::prelude::*;

declare_id!("4Fxm3VkmLo76zuuvuAZYJhtWygDD427zwMpwnMGHHJA4");

#[program]
pub mod sentiment_oracle {
    use anchor_lang::solana_program::{
        program::{invoke, invoke_signed},
        system_instruction::transfer,
    };

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.treasury = ctx.accounts.admin.key();
        config.total_feeds = 0;
        config.total_predictions = 0;
        config.min_stake = 100_000_000;
        config.submission_cooldown = 60; // 60 seconds cooldown
        config.is_paused = false;
        config.bump = ctx.bumps.config;

        let rent = Rent::get()?;
        let vault_rent = rent.minimum_balance(0);

        let transfer_ix = transfer(
            &ctx.accounts.admin.key(),
            &ctx.accounts.vault.key(),
            vault_rent,
        );
        invoke(
            &transfer_ix,
            &[
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        Ok(())
    }

    pub fn register_analyst(
        ctx: Context<RegisterAnalyst>,
        name: String,
        model_hash: String,
    ) -> Result<()> {
        require!(name.len() <= 32, OracleError::NameTooLong);
        require!(model_hash.len() <= 64, OracleError::HashTooLong);

        let analyst = &mut ctx.accounts.analyst;
        analyst.authority = ctx.accounts.authority.key();
        analyst.name = name;
        analyst.model_hash = model_hash;
        analyst.reputation_score = 500;
        analyst.total_predictions = 0;
        analyst.correct_predictions = 0;
        analyst.stake_amount = 0;
        analyst.is_active = true;
        analyst.registered_at = Clock::get()?.unix_timestamp;
        analyst.bump = ctx.bumps.analyst;
        Ok(())
    }

    pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(!config.is_paused, OracleError::Paused);
        require!(amount >= config.min_stake, OracleError::InsufficientStake);

        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.authority.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let analyst = &mut ctx.accounts.analyst;
        analyst.stake_amount = analyst.stake_amount.checked_add(amount).unwrap();

        emit!(StakeDeposited {
            analyst: analyst.authority,
            amount,
            total_stake: analyst.stake_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    pub fn unstake_tokens(ctx: Context<UnstakeTokens>, amount: u64) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(!config.is_paused, OracleError::Paused);
        let analyst = &mut ctx.accounts.analyst;
        require!(
            analyst.stake_amount >= amount,
            OracleError::InsufficientStake
        );

        let remaining = analyst.stake_amount.checked_sub(amount).unwrap();
        require!(
            remaining == 0 || remaining >= config.min_stake,
            OracleError::InsufficientStake
        );

        // Transfer from vault to authority using invoke_signed
        let vault_bump = ctx.bumps.vault;
        let seeds = &[b"vault".as_ref(), &[vault_bump]];
        let signer_seeds = &[&seeds[..]];

        let transfer_ix = transfer(
            &ctx.accounts.vault.key(),
            &ctx.accounts.authority.key(),
            amount,
        );
        invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        analyst.stake_amount = remaining;
        emit!(StakeWithdrawn {
            analyst: analyst.authority,
            amount,
            remaining_stake: analyst.stake_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    pub fn create_sentiment_feed(
        ctx: Context<CreateSentimentFeed>,
        asset_id: String,
        asset_type: AssetType,
    ) -> Result<()> {
        require!(asset_id.len() <= 32, OracleError::AssetIdTooLong);

        let feed = &mut ctx.accounts.sentiment_feed;
        let config = &mut ctx.accounts.config;

        feed.asset_id = asset_id;
        feed.asset_type = asset_type;
        feed.sentiment_score = 50;
        feed.confidence = 0;
        feed.bullish_count = 0;
        feed.bearish_count = 0;
        feed.neutral_count = 0;
        feed.data_points = 0;
        feed.last_updated = 0;
        feed.trend = Trend::Neutral;
        feed.volatility = 0;
        feed.is_active = true;
        feed.bump = ctx.bumps.sentiment_feed;

        config.total_feeds = config.total_feeds.checked_add(1).unwrap();
        Ok(())
    }

    pub fn submit_sentiment(
        ctx: Context<SubmitSentiment>,
        sentiment_score: u8,
        confidence: u8,
        reasoning_hash: String,
        sources: Vec<String>,
    ) -> Result<()> {
        require!(sentiment_score <= 100, OracleError::InvalidScore);
        require!(confidence <= 100, OracleError::InvalidConfidence);
        require!(sources.len() <= 5, OracleError::TooManySources);

        let config = &ctx.accounts.config;
        require!(!config.is_paused, OracleError::Paused);

        let analyst = &mut ctx.accounts.analyst;
        require!(analyst.is_active, OracleError::AnalystInactive);
        require!(
            analyst.stake_amount >= config.min_stake,
            OracleError::InsufficientStake
        );

        // Rate limiting check
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= analyst.last_submission + config.submission_cooldown as i64,
            OracleError::CooldownNotElapsed
        );

        let feed = &mut ctx.accounts.sentiment_feed;
        require!(feed.is_active, OracleError::FeedInactive);

        let old_score = feed.sentiment_score;

        let weight = analyst.reputation_score as u128;
        let total_weight = (feed.data_points as u128 * 500) + weight;
        let new_score = if total_weight > 0 {
            ((feed.sentiment_score as u128 * feed.data_points as u128 * 500
                + sentiment_score as u128 * weight)
                / total_weight) as u8
        } else {
            sentiment_score
        };

        feed.sentiment_score = new_score;
        feed.confidence = ((feed.confidence as u16 + confidence as u16) / 2) as u8;
        feed.data_points = feed.data_points.checked_add(1).unwrap();
        feed.last_updated = clock.unix_timestamp;

        if sentiment_score > 60 {
            feed.bullish_count = feed.bullish_count.checked_add(1).unwrap();
        } else if sentiment_score < 40 {
            feed.bearish_count = feed.bearish_count.checked_add(1).unwrap();
        } else {
            feed.neutral_count = feed.neutral_count.checked_add(1).unwrap();
        }

        feed.trend = if new_score > old_score + 5 {
            Trend::Bullish
        } else if new_score < old_score.saturating_sub(5) {
            Trend::Bearish
        } else {
            Trend::Neutral
        };

        analyst.total_predictions = analyst.total_predictions.checked_add(1).unwrap();
        analyst.last_submission = clock.unix_timestamp;

        emit!(SentimentSubmitted {
            feed: feed.asset_id.clone(),
            analyst: analyst.authority,
            score: sentiment_score,
            confidence,
            weighted_score: new_score,
            timestamp: clock.unix_timestamp,
        });
        Ok(())
    }

    pub fn create_prediction(
        ctx: Context<CreatePrediction>,
        prediction_id: String,
        target_asset: String,
        prediction_type: PredictionType,
        target_value: i64,
        deadline: i64,
    ) -> Result<()> {
        require!(prediction_id.len() <= 32, OracleError::PredictionIdTooLong);
        require!(
            deadline > Clock::get()?.unix_timestamp,
            OracleError::InvalidDeadline
        );

        let prediction = &mut ctx.accounts.prediction;
        let config = &mut ctx.accounts.config;

        prediction.prediction_id = prediction_id;
        prediction.creator = ctx.accounts.creator.key();
        prediction.target_asset = target_asset;
        prediction.prediction_type = prediction_type;
        prediction.target_value = target_value;
        prediction.deadline = deadline;
        prediction.outcome = PredictionOutcome::Pending;
        prediction.yes_stake = 0;
        prediction.no_stake = 0;
        prediction.total_participants = 0;
        prediction.created_at = Clock::get()?.unix_timestamp;
        prediction.resolved_at = 0;
        prediction.bump = ctx.bumps.prediction;

        config.total_predictions = config.total_predictions.checked_add(1).unwrap();

        emit!(PredictionCreated {
            prediction_id: prediction.prediction_id.clone(),
            creator: prediction.creator,
            target_asset: prediction.target_asset.clone(),
            target_value,
            deadline,
            timestamp: prediction.created_at,
        });
        Ok(())
    }

    pub fn place_bet(ctx: Context<PlaceBet>, amount: u64, position: bool) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(!config.is_paused, OracleError::OraclePaused);

        // Get prediction key before mutable borrow
        let prediction_key = ctx.accounts.prediction.key();
        let prediction_id = ctx.accounts.prediction.prediction_id.clone();

        let prediction = &mut ctx.accounts.prediction;
        require!(
            prediction.outcome == PredictionOutcome::Pending,
            OracleError::PredictionResolved
        );

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp < prediction.deadline,
            OracleError::DeadlinePassed
        );

        let transfer_ix = transfer(
            &ctx.accounts.bettor.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        invoke(
            &transfer_ix,
            &[
                ctx.accounts.bettor.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let bet = &mut ctx.accounts.bet;
        bet.amount = amount;
        bet.position = position;
        bet.bettor = ctx.accounts.bettor.key();
        bet.prediction = prediction_key;
        bet.claimed = false;
        bet.placed_at = clock.unix_timestamp;
        bet.bump = ctx.bumps.bet;

        if position {
            prediction.yes_stake = prediction.yes_stake.checked_add(amount).unwrap();
        } else {
            prediction.no_stake = prediction.no_stake.checked_add(amount).unwrap();
        }
        prediction.total_participants = prediction.total_participants.checked_add(1).unwrap();

        emit!(BetPlaced {
            prediction_id,
            bettor: ctx.accounts.bettor.key(),
            amount,
            position,
            timestamp: clock.unix_timestamp,
        });
        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let prediction = &ctx.accounts.prediction;
        let bet = &mut ctx.accounts.bet;

        require!(!bet.claimed, OracleError::AlreadyClaimed);
        require!(
            prediction.outcome != PredictionOutcome::Pending,
            OracleError::PredictionNotResolved
        );

        let won = match prediction.outcome {
            PredictionOutcome::Yes => bet.position == true,
            PredictionOutcome::No => bet.position == false,
            PredictionOutcome::Invalid => true, // refund on invalid
            _ => false,
        };

        if won {
            let payout = if prediction.outcome == PredictionOutcome::Invalid {
                // Refund original amount
                bet.amount
            } else {
                // Calculate winnings: (bet_amount / winning_pool) * total_pool
                let total_pool = prediction
                    .yes_stake
                    .checked_add(prediction.no_stake)
                    .unwrap();
                let winning_pool = if bet.position {
                    prediction.yes_stake
                } else {
                    prediction.no_stake
                };

                if winning_pool == 0 {
                    bet.amount
                } else {
                    (bet.amount as u128)
                        .checked_mul(total_pool as u128)
                        .unwrap()
                        .checked_div(winning_pool as u128)
                        .unwrap() as u64
                }
            };

            // Transfer from vault to bettor using invoke_signed
            let vault_bump = ctx.bumps.vault;
            let seeds = &[b"vault".as_ref(), &[vault_bump]];
            let signer_seeds = &[&seeds[..]];

            let transfer_ix = transfer(
                &ctx.accounts.vault.key(),
                &ctx.accounts.bettor.key(),
                payout,
            );
            invoke_signed(
                &transfer_ix,
                &[
                    ctx.accounts.vault.to_account_info(),
                    ctx.accounts.bettor.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                signer_seeds,
            )?;

            emit!(WinningsClaimed {
                prediction_id: prediction.prediction_id.clone(),
                bettor: bet.bettor,
                payout,
                won,
                timestamp: Clock::get()?.unix_timestamp,
            });
        }

        bet.claimed = true;
        Ok(())
    }

    pub fn resolve_prediction(
        ctx: Context<ResolvePrediction>,
        actual_value: i64,
        proof_hash: String,
    ) -> Result<()> {
        let prediction = &mut ctx.accounts.prediction;
        require!(
            prediction.outcome == PredictionOutcome::Pending,
            OracleError::PredictionResolved
        );
        require!(
            Clock::get()?.unix_timestamp >= prediction.deadline,
            OracleError::DeadlineNotReached
        );

        let outcome = match prediction.prediction_type {
            PredictionType::PriceAbove => {
                if actual_value > prediction.target_value {
                    PredictionOutcome::Yes
                } else {
                    PredictionOutcome::No
                }
            }
            PredictionType::PriceBelow => {
                if actual_value < prediction.target_value {
                    PredictionOutcome::Yes
                } else {
                    PredictionOutcome::No
                }
            }
            PredictionType::SentimentAbove => {
                if actual_value > prediction.target_value {
                    PredictionOutcome::Yes
                } else {
                    PredictionOutcome::No
                }
            }
            PredictionType::Custom => PredictionOutcome::Pending,
        };

        prediction.outcome = outcome;
        prediction.resolved_at = Clock::get()?.unix_timestamp;

        emit!(PredictionResolved {
            prediction_id: prediction.prediction_id.clone(),
            outcome,
            actual_value,
            proof_hash,
            timestamp: prediction.resolved_at,
        });
        Ok(())
    }

    pub fn update_analyst_reputation(ctx: Context<UpdateReputation>, correct: bool) -> Result<()> {
        let analyst = &mut ctx.accounts.analyst;

        if correct {
            analyst.correct_predictions = analyst.correct_predictions.checked_add(1).unwrap();
            analyst.reputation_score = std::cmp::min(1000, analyst.reputation_score + 10);
        } else {
            analyst.reputation_score = analyst.reputation_score.saturating_sub(20);
        }

        emit!(ReputationUpdated {
            analyst: analyst.authority,
            new_score: analyst.reputation_score,
            correct,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    pub fn pause_oracle(ctx: Context<AdminAction>, paused: bool) -> Result<()> {
        ctx.accounts.config.is_paused = paused;
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct OracleConfig {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub total_feeds: u64,
    pub total_predictions: u64,
    pub min_stake: u64,
    pub submission_cooldown: u64, // Cooldown in seconds between submissions
    pub is_paused: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub bettor: Pubkey,
    pub prediction: Pubkey,
    pub amount: u64,
    pub position: bool,
    pub placed_at: i64,
    pub bump: u8,
    pub claimed: bool,
}

#[account]
#[derive(InitSpace)]
pub struct Analyst {
    pub authority: Pubkey,
    #[max_len(32)]
    pub name: String,
    #[max_len(64)]
    pub model_hash: String,
    pub reputation_score: u16,
    pub total_predictions: u64,
    pub correct_predictions: u64,
    pub stake_amount: u64,
    pub last_submission: i64, // Timestamp of last submission for rate limiting
    pub is_active: bool,
    pub registered_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct SentimentFeed {
    #[max_len(32)]
    pub asset_id: String,
    pub asset_type: AssetType,
    pub sentiment_score: u8,
    pub confidence: u8,
    pub bullish_count: u64,
    pub bearish_count: u64,
    pub neutral_count: u64,
    pub data_points: u64,
    pub last_updated: i64,
    pub trend: Trend,
    pub volatility: u8,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Prediction {
    #[max_len(32)]
    pub prediction_id: String,
    pub creator: Pubkey,
    #[max_len(32)]
    pub target_asset: String,
    pub prediction_type: PredictionType,
    pub target_value: i64,
    pub deadline: i64,
    pub outcome: PredictionOutcome,
    pub yes_stake: u64,
    pub no_stake: u64,
    pub total_participants: u32,
    pub created_at: i64,
    pub resolved_at: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + OracleConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, OracleConfig>,
    /// CHECK: Vault PDA to hold staked SOL - initialized with rent
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterAnalyst<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Analyst::INIT_SPACE,
        seeds = [b"analyst", authority.key().as_ref()],
        bump
    )]
    pub analyst: Account<'info, Analyst>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, OracleConfig>,
    #[account(
        mut,
        seeds = [b"analyst", authority.key().as_ref()],
        bump = analyst.bump
    )]
    pub analyst: Account<'info, Analyst>,

    /// CHECK: Vault PDA to hold staked SOL
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, OracleConfig>,
    #[account(
        mut,
        seeds = [b"analyst", authority.key().as_ref()],
        bump = analyst.bump
    )]
    pub analyst: Account<'info, Analyst>,
    /// CHECK: Vault PDA that holds staked SOL
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(asset_id: String)]
pub struct CreateSentimentFeed<'info> {
    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, OracleConfig>,
    #[account(
        init,
        payer = authority,
        space = 8 + SentimentFeed::INIT_SPACE,
        seeds = [b"feed", asset_id.as_bytes()],
        bump
    )]
    pub sentiment_feed: Account<'info, SentimentFeed>,
    #[account(mut, constraint = authority.key() == config.admin @ OracleError::Unauthorized)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitSentiment<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, OracleConfig>,
    #[account(
        mut,
        seeds = [b"analyst", authority.key().as_ref()],
        bump = analyst.bump
    )]
    pub analyst: Account<'info, Analyst>,
    #[account(
        mut,
        seeds = [b"feed", sentiment_feed.asset_id.as_bytes()],
        bump = sentiment_feed.bump
    )]
    pub sentiment_feed: Account<'info, SentimentFeed>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(prediction_id: String)]
pub struct CreatePrediction<'info> {
    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, OracleConfig>,
    #[account(
        init,
        payer = creator,
        space = 8 + Prediction::INIT_SPACE,
        seeds = [b"prediction", prediction_id.as_bytes()],
        bump
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, OracleConfig>,
    #[account(
        mut,
        seeds = [b"prediction", prediction.prediction_id.as_bytes()],
        bump = prediction.bump
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(
        init,
        payer = bettor,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", prediction.prediction_id.as_bytes(), bettor.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(
        seeds = [b"prediction", prediction.prediction_id.as_bytes()],
        bump = prediction.bump
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(
        mut,
        seeds = [b"bet", prediction.prediction_id.as_bytes(), bettor.key().as_ref()],
        bump = bet.bump,
        constraint = bet.bettor == bettor.key() @ OracleError::Unauthorized
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolvePrediction<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, OracleConfig>,
    #[account(
        mut,
        seeds = [b"prediction", prediction.prediction_id.as_bytes()],
        bump = prediction.bump
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(constraint = resolver.key() == config.admin @ OracleError::Unauthorized)]
    pub resolver: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, OracleConfig>,
    #[account(
        mut,
        seeds = [b"analyst", analyst.authority.as_ref()],
        bump = analyst.bump
    )]
    pub analyst: Account<'info, Analyst>,
    #[account(constraint = admin.key() == config.admin @ OracleError::Unauthorized)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = admin.key() == config.admin @ OracleError::Unauthorized
    )]
    pub config: Account<'info, OracleConfig>,
    pub admin: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum AssetType {
    Cryptocurrency,
    Stock,
    Commodity,
    Forex,
    NFT,
    Custom,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Trend {
    Bullish,
    Bearish,
    Neutral,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum PredictionType {
    PriceAbove,
    PriceBelow,
    SentimentAbove,
    Custom,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum PredictionOutcome {
    Pending,
    Yes,
    No,
    Invalid,
}

#[event]
pub struct StakeDeposited {
    pub analyst: Pubkey,
    pub amount: u64,
    pub total_stake: u64,
    pub timestamp: i64,
}

#[event]
pub struct StakeWithdrawn {
    pub analyst: Pubkey,
    pub amount: u64,
    pub remaining_stake: u64,
    pub timestamp: i64,
}

#[event]
pub struct SentimentSubmitted {
    pub feed: String,
    pub analyst: Pubkey,
    pub score: u8,
    pub confidence: u8,
    pub weighted_score: u8,
    pub timestamp: i64,
}

#[event]
pub struct PredictionCreated {
    pub prediction_id: String,
    pub creator: Pubkey,
    pub target_asset: String,
    pub target_value: i64,
    pub deadline: i64,
    pub timestamp: i64,
}

#[event]
pub struct BetPlaced {
    pub prediction_id: String,
    pub bettor: Pubkey,
    pub amount: u64,
    pub position: bool,
    pub timestamp: i64,
}

#[event]
pub struct PredictionResolved {
    pub prediction_id: String,
    pub outcome: PredictionOutcome,
    pub actual_value: i64,
    pub proof_hash: String,
    pub timestamp: i64,
}

#[event]
pub struct ReputationUpdated {
    pub analyst: Pubkey,
    pub new_score: u16,
    pub correct: bool,
    pub timestamp: i64,
}

#[event]
pub struct WinningsClaimed {
    pub prediction_id: String,
    pub bettor: Pubkey,
    pub payout: u64,
    pub won: bool,
    pub timestamp: i64,
}

#[error_code]
pub enum OracleError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Oracle is paused")]
    Paused,
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Hash too long")]
    HashTooLong,
    #[msg("Asset ID too long")]
    AssetIdTooLong,
    #[msg("Prediction ID too long")]
    PredictionIdTooLong,
    #[msg("Invalid sentiment score")]
    InvalidScore,
    #[msg("Invalid confidence")]
    InvalidConfidence,
    #[msg("Too many sources")]
    TooManySources,
    #[msg("Insufficient stake")]
    InsufficientStake,
    #[msg("Analyst inactive")]
    AnalystInactive,
    #[msg("Feed inactive")]
    FeedInactive,
    #[msg("Prediction already resolved")]
    PredictionResolved,
    #[msg("Deadline passed")]
    DeadlinePassed,
    #[msg("Deadline not reached")]
    DeadlineNotReached,
    #[msg("Invalid deadline")]
    InvalidDeadline,
    #[msg("Oracle is paused")]
    OraclePaused,
    #[msg("Bet already claimed")]
    AlreadyClaimed,
    #[msg("Prediction not yet resolved")]
    PredictionNotResolved,
    #[msg("Cooldown period not elapsed")]
    CooldownNotElapsed,
}
