import Customer from "@/models/Customer";

/**
 * Generates a unique account number for a new customer
 * Format: 10 random digits (e.g., 1234567890)
 */
export async function generateUniqueAccountNumber(): Promise<string> {
  let accountNumber: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 10 random digits
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    accountNumber = `${randomDigits}`;

    // Check if this account number already exists
    const existingCustomer = await Customer.findOne({ accountNumber });
    if (!existingCustomer) {
      isUnique = true;
    } 
    attempts++;
  } 

  if (!isUnique) {
    throw new Error("Failed to generate unique account number after multiple attempts");
  }

  return accountNumber!;
}
