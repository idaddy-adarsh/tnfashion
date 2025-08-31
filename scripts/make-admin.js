const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function makeUserAdmin(email) {
  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: node scripts/make-admin.js your-email@example.com');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB...');
    
    const db = client.db();
    
    // Update user in the custom users collection
    const result = await db.collection('users').updateOne(
      { email: email },
      { $set: { isAdmin: true } },
      { upsert: false }
    );
    
    if (result.matchedCount === 0) {
      console.log(`❌ User with email ${email} not found.`);
      console.log('Make sure the user has signed in at least once.');
      return;
    }
    
    if (result.modifiedCount === 1) {
      console.log(`✅ Successfully made ${email} an admin!`);
    } else {
      console.log(`ℹ️  User ${email} was already an admin.`);
    }
    
    // Also update in nextauth_users collection if exists
    const nextAuthResult = await db.collection('nextauth_users').updateOne(
      { email: email },
      { $set: { isAdmin: true } }
    );
    
    if (nextAuthResult.modifiedCount > 0) {
      console.log('✅ Also updated NextAuth user record');
    }
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line arguments
const email = process.argv[2];
makeUserAdmin(email);
