// Test script to verify registration with base location
const testRegistrationWithLocation = async () => {
  const registrationData = {
    email: "test_location@example.com",
    password: "TestPass@123",
    username: "testlocation",
    display_name: "Test Location User",
    bio: "Testing base location functionality",
    base_latitude: 28.6139,  // New Delhi coordinates
    base_longitude: 77.2090
  };

  try {
    console.log('🔍 Testing registration with location data:');
    console.log(JSON.stringify(registrationData, null, 2));

    const response = await fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('📝 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Registration failed:');
      console.log('📝 Error:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

testRegistrationWithLocation();
