/**
 * SendGrid Configuration Test Script
 * Run with: npx ts-node scripts/test-sendgrid.ts
 */

import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testSendGrid() {
  console.log('\n🔍 SendGrid Configuration Test\n');
  console.log('='.repeat(50));

  // Check API Key
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.log('❌ SENDGRID_API_KEY: Not found');
    console.log('\n   Add this to your .env.local file:');
    console.log('   SENDGRID_API_KEY=SG.your_api_key_here\n');
    return;
  }
  
  if (!apiKey.startsWith('SG.')) {
    console.log('❌ SENDGRID_API_KEY: Invalid format (should start with "SG.")');
    return;
  }
  console.log('✅ SENDGRID_API_KEY: Found (starts with SG.)');

  // Check From Email
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!fromEmail) {
    console.log('⚠️  SENDGRID_FROM_EMAIL: Not set (will use default)');
  } else {
    console.log(`✅ SENDGRID_FROM_EMAIL: ${fromEmail}`);
  }

  // Check From Name
  const fromName = process.env.SENDGRID_FROM_NAME;
  if (!fromName) {
    console.log('⚠️  SENDGRID_FROM_NAME: Not set (will use default)');
  } else {
    console.log(`✅ SENDGRID_FROM_NAME: ${fromName}`);
  }

  // Check Contact Notification Email
  const contactEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (!contactEmail) {
    console.log('⚠️  CONTACT_NOTIFICATION_EMAIL: Not set (will use default)');
  } else {
    console.log(`✅ CONTACT_NOTIFICATION_EMAIL: ${contactEmail}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📧 Testing SendGrid API Connection...\n');

  // Initialize SendGrid
  sgMail.setApiKey(apiKey);

  // Test API connection by getting API key info
  try {
    // Send a test email (to your own email for verification)
    const testEmail = process.argv[2]; // Pass email as argument
    
    if (!testEmail) {
      console.log('ℹ️  To send a test email, run:');
      console.log('   npx ts-node scripts/test-sendgrid.ts your-email@example.com\n');
      
      // Just verify the API key works
      const msg = {
        to: fromEmail || 'test@example.com',
        from: {
          email: fromEmail || 'test@example.com',
          name: fromName || 'Test',
        },
        subject: 'SendGrid Test',
        text: 'This is a test',
        mailSettings: {
          sandboxMode: {
            enable: true, // Don't actually send, just validate
          },
        },
      };

      await sgMail.send(msg);
      console.log('✅ SendGrid API Key is VALID');
      console.log('✅ API connection successful\n');
      
      console.log('⚠️  IMPORTANT: Make sure your sender email is verified!');
      console.log(`   Go to: https://app.sendgrid.com/settings/sender_auth`);
      console.log(`   Verify: ${fromEmail || 'your sender email'}\n`);
      
    } else {
      // Send actual test email
      console.log(`Sending test email to: ${testEmail}`);
      
      const msg = {
        to: testEmail,
        from: {
          email: fromEmail || 'test@example.com',
          name: fromName || 'AfriVerse',
        },
        subject: '✅ AfriVerse SendGrid Test - Success!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; padding: 20px; text-align: center;">
              <h1 style="color: #f59e0b; margin: 0;">🎉 SendGrid is Working!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p>Congratulations! Your SendGrid configuration is correct.</p>
              <p>This means:</p>
              <ul>
                <li>✅ API Key is valid</li>
                <li>✅ Sender email is verified</li>
                <li>✅ Email delivery is working</li>
              </ul>
              <p>Your contact form should now send emails properly!</p>
            </div>
            <div style="background: #1a1a2e; padding: 15px; text-align: center;">
              <p style="color: #888; margin: 0; font-size: 12px;">Sent from AfriVerse at ${new Date().toISOString()}</p>
            </div>
          </div>
        `,
      };

      const response = await sgMail.send(msg);
      console.log('\n✅ Test email sent successfully!');
      console.log(`   Status: ${response[0].statusCode}`);
      console.log(`   Check your inbox: ${testEmail}\n`);
    }
    
  } catch (error: any) {
    console.log('\n❌ SendGrid API Error:\n');
    
    if (error.response) {
      const { body } = error.response;
      console.log('   Status:', error.code);
      
      if (body?.errors) {
        body.errors.forEach((err: any, i: number) => {
          console.log(`   Error ${i + 1}: ${err.message}`);
          
          if (err.message.includes('sender')) {
            console.log('\n   💡 FIX: Verify your sender email at:');
            console.log('      https://app.sendgrid.com/settings/sender_auth');
          }
          
          if (err.message.includes('authorization') || err.message.includes('api key')) {
            console.log('\n   💡 FIX: Check your API key at:');
            console.log('      https://app.sendgrid.com/settings/api_keys');
          }
        });
      } else {
        console.log('   Body:', JSON.stringify(body, null, 2));
      }
    } else {
      console.log('   Message:', error.message);
    }
  }

  console.log('='.repeat(50));
}

testSendGrid();
