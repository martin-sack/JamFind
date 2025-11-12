// Test script for recommendation engine
// Run with: node scripts/test-recommendations.js

const BASE_URL = 'http://localhost:3000';

async function testRecommendations() {
  console.log('🧪 Testing JamFind Recommendation Engine...\n');
  
  try {
    // Test the recommendation endpoint (requires authentication)
    const response = await fetch(`${BASE_URL}/api/recommend/me`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Include cookies for auth
    });
    
    if (response.status === 401) {
      console.log('⚠️  Recommendation endpoint requires authentication');
      console.log('   Visit http://localhost:3000/auth/signin to sign in first');
      return;
    }
    
    if (!response.ok) {
      console.log(`❌ Recommendation API failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Recommendation API working!');
    console.log(`📊 Found ${data.recs?.length || 0} recommendations`);
    
    if (data.recs && data.recs.length > 0) {
      console.log('\n🎵 Sample recommendations:');
      data.recs.slice(0, 3).forEach((track, i) => {
        console.log(`   ${i + 1}. ${track.title} - ${track.artist?.name || 'Unknown Artist'}`);
        console.log(`      Genre: ${track.genres}, Mood: ${track.moods}`);
      });
    } else {
      console.log('\n💡 No recommendations yet - try listening to some tracks first!');
    }
    
  } catch (error) {
    console.log('❌ Failed to test recommendations:', error.message);
  }
}

testRecommendations();
