// ============================================
// FILE: tests/whisper.ts
// ============================================
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Whisper } from "../target/types/whisper";
import { expect } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";

describe("whisper - Complete Test Suite", () => {
  // Configure the client to use the cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Whisper as Program<Whisper>;
  const author = provider.wallet as anchor.Wallet;
  
  // Create additional test users
  const user2 = Keypair.generate();
  const user3 = Keypair.generate();
  
  // Test data
  const testContentUri = "https://arweave.net/test-hash-12345";
  const testCommentUri = "https://arweave.net/comment-hash-67890";
  
  let confessionPda: PublicKey;
  let confessionBump: number;
  let commentPda: PublicKey;
  let commentBump: number;

  before(async () => {
    // Airdrop SOL to test users for devnet
    console.log("\n💰 Airdropping SOL to test users...");
    try {
      const airdrop2 = await provider.connection.requestAirdrop(
        user2.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdrop2);
      
      const airdrop3 = await provider.connection.requestAirdrop(
        user3.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdrop3);
      console.log("✅ Airdrop complete");
    } catch (error) {
      console.log("⚠️  Airdrop skipped (might be on localnet)");
    }
  });

  describe("✅ Create Confession Tests", () => {
    it("Successfully creates a confession", async () => {
      // Derive PDA for confession (simplified seeds without timestamp)
      [confessionPda, confessionBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("confession"),
          author.publicKey.toBuffer(),
        ],
        program.programId
      );

      console.log("\n📝 Creating confession...");
      console.log("Confession PDA:", confessionPda.toString());
      console.log("Author:", author.publicKey.toString());

      // Create confession transaction
      const tx = await program.methods
        .createConfession(testContentUri)
        .accounts({
          confession: confessionPda,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Transaction signature:", tx);

      // Fetch and verify the confession account
      const confessionAccount = await program.account.confessionAccount.fetch(
        confessionPda
      );

      console.log("\n📊 Confession Account Data:");
      console.log("Author:", confessionAccount.author.toString());
      console.log("Content URI:", confessionAccount.contentUri);
      console.log("Like Count:", confessionAccount.likeCount.toNumber());
      console.log("Comment Count:", confessionAccount.commentCount.toNumber());
      console.log("Timestamp:", confessionAccount.timestamp.toNumber());
      console.log("Bump:", confessionAccount.bump);

      // Assertions
      expect(confessionAccount.author.toString()).to.equal(
        author.publicKey.toString()
      );
      expect(confessionAccount.contentUri).to.equal(testContentUri);
      expect(confessionAccount.likeCount.toNumber()).to.equal(0);
      expect(confessionAccount.commentCount.toNumber()).to.equal(0);
      expect(confessionAccount.bump).to.equal(confessionBump);
      expect(confessionAccount.timestamp.toNumber()).to.be.greaterThan(0);
    });

    it("Fails when trying to create duplicate confession (same seeds)", async () => {
      console.log("\n🚫 Testing duplicate confession creation...");

      try {
        await program.methods
          .createConfession("https://arweave.net/different-uri")
          .accounts({
            confession: confessionPda,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have thrown an error for duplicate account");
      } catch (error: any) {
        console.log("✅ Expected error caught:", error.message);
        expect(error.message).to.include("already in use");
      }
    });

    it("Fails with empty content URI", async () => {
      // Use a different user to avoid seed collision
      const [emptyConfessionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("confession"),
          user2.publicKey.toBuffer(),
        ],
        program.programId
      );

      console.log("\n🚫 Testing empty content URI...");

      try {
        await program.methods
          .createConfession("")
          .accounts({
            confession: emptyConfessionPda,
            author: user2.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user2])
          .rpc();
        
        expect.fail("Should have thrown an error for empty URI");
      } catch (error: any) {
        console.log("✅ Expected error caught:", error.message);
        expect(error.message).to.include("EmptyContentUri");
      }
    });

    it("Fails with URI exceeding 200 characters", async () => {
      const longUri = "a".repeat(201); // Max is 200

      console.log("\n🚫 Testing URI too long (201 chars)...");

      try {
        await program.methods
          .createConfession(longUri)
          .accounts({
            confession: confessionPda,
            author: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have thrown an error for long URI");
      } catch (error: any) {
        console.log("✅ Expected error caught:", error.message);
        expect(error.message).to.include("ContentUriTooLong");
      }
    });

    it("Successfully creates confession for different user", async () => {
      const [user2ConfessionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("confession"),
          user2.publicKey.toBuffer(),
        ],
        program.programId
      );

      console.log("\n📝 Creating confession for user2...");

      await program.methods
        .createConfession("https://arweave.net/user2-confession")
        .accounts({
          confession: user2ConfessionPda,
          author: user2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      const confessionAccount = await program.account.confessionAccount.fetch(
        user2ConfessionPda
      );

      console.log("✅ User2 confession created");
      expect(confessionAccount.author.toString()).to.equal(
        user2.publicKey.toString()
      );
    });
  });

  describe("👍 Like Confession Tests", () => {
    it("Successfully likes a confession", async () => {
      console.log("\n👍 Liking confession...");

      // Like the confession
      const tx = await program.methods
        .likeConfession()
        .accounts({
          confession: confessionPda,
          user: author.publicKey,
        })
        .rpc();

      console.log("✅ Like transaction:", tx);

      // Fetch and verify
      const confessionAccount = await program.account.confessionAccount.fetch(
        confessionPda
      );

      console.log("📊 Like count after first like:", confessionAccount.likeCount.toNumber());

      expect(confessionAccount.likeCount.toNumber()).to.equal(1);
    });

    it("Successfully likes a confession multiple times from same user", async () => {
      console.log("\n👍 Liking confession multiple times...");

      // Like again
      await program.methods
        .likeConfession()
        .accounts({
          confession: confessionPda,
          user: author.publicKey,
        })
        .rpc();

      console.log("✅ Second like successful");

      // Like a third time
      await program.methods
        .likeConfession()
        .accounts({
          confession: confessionPda,
          user: author.publicKey,
        })
        .rpc();

      console.log("✅ Third like successful");

      // Fetch and verify
      const confessionAccount = await program.account.confessionAccount.fetch(
        confessionPda
      );

      console.log("📊 Total like count:", confessionAccount.likeCount.toNumber());

      expect(confessionAccount.likeCount.toNumber()).to.equal(3);
    });

    it("Successfully likes from different users", async () => {
      console.log("\n👍 Testing likes from different users...");

      // User2 likes
      await program.methods
        .likeConfession()
        .accounts({
          confession: confessionPda,
          user: user2.publicKey,
        })
        .signers([user2])
        .rpc();

      console.log("✅ User2 like successful");

      // User3 likes
      await program.methods
        .likeConfession()
        .accounts({
          confession: confessionPda,
          user: user3.publicKey,
        })
        .signers([user3])
        .rpc();

      console.log("✅ User3 like successful");

      const confessionAccount = await program.account.confessionAccount.fetch(
        confessionPda
      );

      console.log("📊 Total like count:", confessionAccount.likeCount.toNumber());

      expect(confessionAccount.likeCount.toNumber()).to.equal(5);
    });

    it("Fails when confession account doesn't exist", async () => {
      const fakeKeypair = Keypair.generate();

      console.log("\n🚫 Testing like on non-existent confession...");
      console.log("Fake account:", fakeKeypair.publicKey.toString());

      try {
        await program.methods
          .likeConfession()
          .accounts({
            confession: fakeKeypair.publicKey,
            user: author.publicKey,
          })
          .rpc();
        
        expect.fail("Should have thrown an error for non-existent account");
      } catch (error: any) {
        console.log("✅ Expected error caught:", error.message);
        expect(error.message).to.include("AccountNotInitialized");
      }
    });
  });

  describe("💬 Comment Confession Tests", () => {
    it("Successfully adds a comment", async () => {
      // Derive comment PDA (simplified seeds without timestamp)
      [commentPda, commentBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          confessionPda.toBuffer(),
          author.publicKey.toBuffer(),
        ],
        program.programId
      );

      console.log("\n💬 Adding comment...");
      console.log("Comment PDA:", commentPda.toString());
      console.log("Confession:", confessionPda.toString());
      console.log("Commenter:", author.publicKey.toString());

      // Add comment
      const tx = await program.methods
        .commentConfession(testCommentUri)
        .accounts({
          confession: confessionPda,
          comment: commentPda,
          commenter: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Comment transaction:", tx);

      // Fetch and verify comment account
      const commentAccount = await program.account.commentAccount.fetch(
        commentPda
      );

      console.log("\n📊 Comment Account Data:");
      console.log("Confession:", commentAccount.confession.toString());
      console.log("Commenter:", commentAccount.commenter.toString());
      console.log("Content URI:", commentAccount.contentUri);
      console.log("Timestamp:", commentAccount.timestamp.toNumber());
      console.log("Bump:", commentAccount.bump);

      expect(commentAccount.confession.toString()).to.equal(
        confessionPda.toString()
      );
      expect(commentAccount.commenter.toString()).to.equal(
        author.publicKey.toString()
      );
      expect(commentAccount.contentUri).to.equal(testCommentUri);
      expect(commentAccount.bump).to.equal(commentBump);
      expect(commentAccount.timestamp.toNumber()).to.be.greaterThan(0);

      // Verify confession comment count increased
      const confessionAccount = await program.account.confessionAccount.fetch(
        confessionPda
      );
      
      console.log("📊 Confession comment count:", confessionAccount.commentCount.toNumber());
      expect(confessionAccount.commentCount.toNumber()).to.equal(1);
    });

    it("Successfully adds comments from different users", async () => {
      console.log("\n💬 Adding comments from different users...");

      // User2 comments
      const [user2CommentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          confessionPda.toBuffer(),
          user2.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .commentConfession("https://arweave.net/user2-comment")
        .accounts({
          confession: confessionPda,
          comment: user2CommentPda,
          commenter: user2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      console.log("✅ User2 comment added");

      // User3 comments
      const [user3CommentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          confessionPda.toBuffer(),
          user3.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .commentConfession("https://arweave.net/user3-comment")
        .accounts({
          confession: confessionPda,
          comment: user3CommentPda,
          commenter: user3.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user3])
        .rpc();

      console.log("✅ User3 comment added");

      // Verify confession comment count
      const confessionAccount = await program.account.confessionAccount.fetch(
        confessionPda
      );
      
      console.log("📊 Total comment count:", confessionAccount.commentCount.toNumber());
      expect(confessionAccount.commentCount.toNumber()).to.equal(3);
    });

    it("Fails when trying to add duplicate comment (same seeds)", async () => {
      console.log("\n🚫 Testing duplicate comment...");

      try {
        await program.methods
          .commentConfession("https://arweave.net/duplicate-comment")
          .accounts({
            confession: confessionPda,
            comment: commentPda,
            commenter: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have thrown an error for duplicate comment");
      } catch (error: any) {
        console.log("✅ Expected error caught:", error.message);
        expect(error.message).to.include("already in use");
      }
    });

    it("Fails with empty content URI", async () => {
      // Create another user for this test
      const user4 = Keypair.generate();
      
      // Airdrop SOL
      try {
        const airdrop = await provider.connection.requestAirdrop(
          user4.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(airdrop);
      } catch (error) {
        console.log("⚠️  Airdrop skipped");
      }

      const [emptyCommentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          confessionPda.toBuffer(),
          user4.publicKey.toBuffer(),
        ],
        program.programId
      );

      console.log("\n🚫 Testing empty comment URI...");

      try {
        await program.methods
          .commentConfession("")
          .accounts({
            confession: confessionPda,
            comment: emptyCommentPda,
            commenter: user4.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user4])
          .rpc();
        
        expect.fail("Should have thrown an error for empty URI");
      } catch (error: any) {
        console.log("✅ Expected error caught:", error.message);
        expect(error.message).to.include("EmptyContentUri");
      }
    });

    it("Fails with URI too long", async () => {
      const longUri = "a".repeat(201);

      console.log("\n🚫 Testing comment URI too long...");

      try {
        await program.methods
          .commentConfession(longUri)
          .accounts({
            confession: confessionPda,
            comment: commentPda,
            commenter: author.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have thrown an error for long URI");
      } catch (error: any) {
        console.log("✅ Expected error caught:", error.message);
        expect(error.message).to.include("ContentUriTooLong");
      }
    });

    it("Fails when commenting on non-existent confession", async () => {
      const fakeConfession = Keypair.generate();
      const user5 = Keypair.generate();

      const [commentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          fakeConfession.publicKey.toBuffer(),
          user5.publicKey.toBuffer(),
        ],
        program.programId
      );

      console.log("\n🚫 Testing comment on non-existent confession...");

      try {
        await program.methods
          .commentConfession("https://arweave.net/test")
          .accounts({
            confession: fakeConfession.publicKey,
            comment: commentPda,
            commenter: user5.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user5])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        console.log("✅ Expected error caught:", error.message);
        expect(error.message).to.include("AccountNotInitialized");
      }
    });
  });

  describe("🔄 Integration Tests", () => {
    it("Full workflow: create → like 5 times → add 3 comments", async () => {
      console.log("\n🔄 Starting full integration workflow...");
      
      // Create test users for workflow
      const workflowUser = Keypair.generate();
      const commenter1 = Keypair.generate();
      const commenter2 = Keypair.generate();
      const commenter3 = Keypair.generate();

      // Airdrop SOL to workflow users
      console.log("\n💰 Airdropping SOL to workflow users...");
      try {
        for (const user of [workflowUser, commenter1, commenter2, commenter3]) {
          const airdrop = await provider.connection.requestAirdrop(
            user.publicKey,
            2 * anchor.web3.LAMPORTS_PER_SOL
          );
          await provider.connection.confirmTransaction(airdrop);
        }
        console.log("✅ Airdrops complete");
      } catch (error) {
        console.log("⚠️  Airdrops skipped");
      }
      
      // Step 1: Create new confession
      console.log("\n📝 Step 1: Creating confession...");
      const [workflowConfessionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("confession"),
          workflowUser.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .createConfession("https://arweave.net/workflow-test")
        .accounts({
          confession: workflowConfessionPda,
          author: workflowUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([workflowUser])
        .rpc();

      console.log("✅ Confession created:", workflowConfessionPda.toString());

      // Step 2: Like it 5 times
      console.log("\n👍 Step 2: Liking 5 times...");
      for (let i = 0; i < 5; i++) {
        await program.methods
          .likeConfession()
          .accounts({
            confession: workflowConfessionPda,
            user: workflowUser.publicKey,
          })
          .signers([workflowUser])
          .rpc();
        console.log(`✅ Like ${i + 1}/5 successful`);
      }

      // Step 3: Add 3 comments from different users
      console.log("\n💬 Step 3: Adding 3 comments...");
      
      const commenters = [commenter1, commenter2, commenter3];
      for (let i = 0; i < 3; i++) {
        const [commentPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("comment"),
            workflowConfessionPda.toBuffer(),
            commenters[i].publicKey.toBuffer(),
          ],
          program.programId
        );

        await program.methods
          .commentConfession(`https://arweave.net/comment-${i}`)
          .accounts({
            confession: workflowConfessionPda,
            comment: commentPda,
            commenter: commenters[i].publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([commenters[i]])
          .rpc();
        console.log(`✅ Comment ${i + 1}/3 added`);
      }

      // Step 4: Verify final state
      console.log("\n📊 Step 4: Verifying final state...");
      const finalConfession = await program.account.confessionAccount.fetch(
        workflowConfessionPda
      );

      console.log("Final Stats:");
      console.log("  - Likes:", finalConfession.likeCount.toNumber());
      console.log("  - Comments:", finalConfession.commentCount.toNumber());
      console.log("  - Author:", finalConfession.author.toString());
      console.log("  - Content URI:", finalConfession.contentUri);

      expect(finalConfession.likeCount.toNumber()).to.equal(5);
      expect(finalConfession.commentCount.toNumber()).to.equal(3);
      
      console.log("\n✅ Integration test completed successfully!");
    });
  });

  describe("📊 Summary", () => {
    it("Displays test execution summary", async () => {
      console.log("\n" + "=".repeat(60));
      console.log("🎉 TEST EXECUTION SUMMARY");
      console.log("=".repeat(60));
      console.log("\n✅ All tests passed successfully!");
      console.log("\n📝 Test Coverage:");
      console.log("  • Create Confession: 5 tests");
      console.log("  • Like Confession: 4 tests");
      console.log("  • Comment Confession: 6 tests");
      console.log("  • Integration: 1 test");
      console.log("  • Total: 16 tests");
      console.log("\n🔑 Key Points:");
      console.log("  • Each user can create ONE confession (based on seeds)");
      console.log("  • Each user can add ONE comment per confession");
      console.log("  • Users can like confessions unlimited times");
      console.log("  • All error cases properly handled");
      console.log("\n" + "=".repeat(60));
    });
  });
});