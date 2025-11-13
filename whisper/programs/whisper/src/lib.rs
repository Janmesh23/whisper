// ============================================
// FILE: programs/whisper/src/lib.rs
// ============================================
use anchor_lang::prelude::*;

declare_id!("DHTV8Z1MNm7C5vNX5mUrR1QdNzipbytaHFimTZbycH9R");

#[program]
pub mod whisper {
    use super::*;

    pub fn create_confession(
        ctx: Context<CreateConfession>,
        content_uri: String,
    ) -> Result<()> {
        require!(
            content_uri.len() <= ConfessionAccount::MAX_URI_LENGTH,
            WhisperError::ContentUriTooLong
        );
        require!(!content_uri.is_empty(), WhisperError::EmptyContentUri);

        let confession = &mut ctx.accounts.confession;
        let clock = Clock::get()?;

        confession.author = ctx.accounts.author.key();
        confession.content_uri = content_uri;
        confession.like_count = 0;
        confession.comment_count = 0;
        confession.timestamp = clock.unix_timestamp;
        confession.bump = ctx.bumps.confession;

        msg!("Confession created: {}", confession.key());
        Ok(())
    }

    pub fn like_confession(ctx: Context<LikeConfession>) -> Result<()> {
        let confession = &mut ctx.accounts.confession;
        
        confession.like_count = confession
            .like_count
            .checked_add(1)
            .ok_or(WhisperError::LikeCountOverflow)?;

        msg!("Confession liked. Total likes: {}", confession.like_count);
        Ok(())
    }

    pub fn comment_confession(
        ctx: Context<CommentConfession>,
        content_uri: String,
    ) -> Result<()> {
        require!(
            content_uri.len() <= CommentAccount::MAX_URI_LENGTH,
            WhisperError::ContentUriTooLong
        );
        require!(!content_uri.is_empty(), WhisperError::EmptyContentUri);

        let confession = &mut ctx.accounts.confession;
        let comment = &mut ctx.accounts.comment;
        let clock = Clock::get()?;

        comment.confession = confession.key();
        comment.commenter = ctx.accounts.commenter.key();
        comment.content_uri = content_uri;
        comment.timestamp = clock.unix_timestamp;
        comment.bump = ctx.bumps.comment;

        confession.comment_count = confession
            .comment_count
            .checked_add(1)
            .ok_or(WhisperError::CommentCountOverflow)?;

        msg!("Comment added to confession: {}", confession.key());
        Ok(())
    }
}

// ============================================
// ACCOUNT STRUCTURES
// ============================================

#[account]
pub struct ConfessionAccount {
    pub author: Pubkey,
    pub content_uri: String,
    pub like_count: u64,
    pub comment_count: u64,
    pub timestamp: i64,
    pub bump: u8,
}

impl ConfessionAccount {
    pub const MAX_URI_LENGTH: usize = 200;
    pub const SPACE: usize = 8 + 32 + 4 + Self::MAX_URI_LENGTH + 8 + 8 + 8 + 1;
}

#[account]
pub struct CommentAccount {
    pub confession: Pubkey,
    pub commenter: Pubkey,
    pub content_uri: String,
    pub timestamp: i64,
    pub bump: u8,
}

impl CommentAccount {
    pub const MAX_URI_LENGTH: usize = 200;
    pub const SPACE: usize = 8 + 32 + 32 + 4 + Self::MAX_URI_LENGTH + 8 + 1;
}

// ============================================
// CONTEXT STRUCTURES
// ============================================

#[derive(Accounts)]
#[instruction(content_uri: String)]
pub struct CreateConfession<'info> {
    #[account(
        init,
        payer = author,
        space = ConfessionAccount::SPACE,
        seeds = [
            b"confession",
            author.key().as_ref(),
        ],
        bump
    )]
    pub confession: Account<'info, ConfessionAccount>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LikeConfession<'info> {
    #[account(mut)]
    pub confession: Account<'info, ConfessionAccount>,

    pub user: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(content_uri: String)]
pub struct CommentConfession<'info> {
    #[account(mut)]
    pub confession: Account<'info, ConfessionAccount>,

    #[account(
        init,
        payer = commenter,
        space = CommentAccount::SPACE,
        seeds = [
            b"comment",
            confession.key().as_ref(),
            commenter.key().as_ref(),
        ],
        bump
    )]
    pub comment: Account<'info, CommentAccount>,

    #[account(mut)]
    pub commenter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================
// ERROR DEFINITIONS
// ============================================

#[error_code]
pub enum WhisperError {
    #[msg("Content URI exceeds maximum allowed length")]
    ContentUriTooLong,
    
    #[msg("Content URI cannot be empty")]
    EmptyContentUri,
    
    #[msg("Like count overflow")]
    LikeCountOverflow,
    
    #[msg("Comment count overflow")]
    CommentCountOverflow,
}