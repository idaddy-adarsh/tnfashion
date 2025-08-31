// Run this script to clear authentication cookies and reset state
// You can run this with: node clear-auth.js

console.log('🔧 Clearing NextAuth.js cookies and resetting authentication state...\n')

console.log('Please follow these steps to clear the invalid JWT tokens:\n')

console.log('1. Open your browser and go to: http://localhost:3000')
console.log('2. Open Developer Tools (F12 or Ctrl+Shift+I)')
console.log('3. Go to the "Application" or "Storage" tab')
console.log('4. In the left sidebar, find "Cookies" and expand it')
console.log('5. Click on "http://localhost:3000"')
console.log('6. Look for cookies that start with:')
console.log('   - next-auth.session-token')
console.log('   - __Secure-next-auth.session-token')
console.log('   - next-auth.csrf-token')
console.log('   - __Host-next-auth.csrf-token')
console.log('7. DELETE all these cookies by right-clicking and selecting "Delete"')
console.log('8. Refresh the page (F5 or Ctrl+R)')
console.log('9. The JWT_SESSION_ERROR should be gone!\n')

console.log('Alternative method (easier):')
console.log('1. Open browser in Incognito/Private mode')
console.log('2. Go to: http://localhost:3000')
console.log('3. Test the authentication there\n')

console.log('✅ After clearing cookies, you should be able to:')
console.log('- Access the signin page without errors')
console.log('- Sign in with Google OAuth')
console.log('- Access the dashboard after signing in')

console.log('\n🚀 Ready to test the authentication flow!')
