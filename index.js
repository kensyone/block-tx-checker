const { ethers } = require('ethers');

// Taraxa network RPC URL
const taraxaRpcUrl = 'https://rpc.mainnet.taraxa.io/'; // Replace with the correct Taraxa RPC URL

// Create a provider for the Taraxa network
const provider = new ethers.JsonRpcProvider(taraxaRpcUrl);

// Batch size for fetching receipts (adjust based on RPC limits)
const BATCH_SIZE = 100; // Fetch 100 receipts at a time

async function getFailedTransactionsInBlock(blockNumber) {
  try {
    // Get the block with full transaction details
    const block = await provider.getBlock(blockNumber, true); // Include full transactions
    if (!block || !block.transactions) {
      console.log('Block not found or no transactions in the block.');
      return 0;
    }

    console.log(`Total transactions in block: ${block.transactions.length}`);

    let failedTxs = 0;

    // Process transactions in batches
    for (let i = 0; i < block.transactions.length; i += BATCH_SIZE) {
      const batch = block.transactions.slice(i, i + BATCH_SIZE);

      // Fetch receipts for the current batch
      const receipts = await Promise.all(
        batch.map(tx => {
          const txHash = typeof tx === 'string' ? tx : tx.hash;
          return provider.getTransactionReceipt(txHash).catch(() => null); // Handle errors
        })
      );

      // Count failed transactions in the batch
      for (const receipt of receipts) {
        if (receipt && receipt.status === 0) { // Check if the transaction failed
          failedTxs++;
          console.log(`Failed TX: ${receipt.transactionHash}`);
        }
      }

      console.log(`Processed ${i + batch.length} transactions...`);
    }

    console.log(`Total failed transactions in block ${blockNumber}: ${failedTxs}`);
    return failedTxs;
  } catch (error) {
    console.error('Error fetching block or transaction data:', error);
  }
}

// Example usage: Check failed transactions in a specific block
const blockNumber = 16161419; // Replace with the block number you want to check
getFailedTransactionsInBlock(blockNumber);