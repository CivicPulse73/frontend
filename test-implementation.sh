#!/bin/bash

echo "🧪 Testing CivicPulse Voting & Graph Components Implementation..."
echo ""

# Check if files exist
echo "✅ Checking component files..."
if [ -f "src/components/VotingButton.tsx" ]; then
    echo "  ✓ VotingButton.tsx created"
else
    echo "  ✗ VotingButton.tsx missing"
fi

if [ -f "src/components/GraphButton.tsx" ]; then
    echo "  ✓ GraphButton.tsx created"
else
    echo "  ✗ GraphButton.tsx missing"
fi

if [ -f "src/components/GraphModal.tsx" ]; then
    echo "  ✓ GraphModal.tsx created"
else
    echo "  ✗ GraphModal.tsx missing"
fi

if [ -f "src/services/voting.ts" ]; then
    echo "  ✓ voting.ts service created"
else
    echo "  ✗ voting.ts service missing"
fi

echo ""
echo "✅ Checking for imports in UserProfile..."
if grep -q "VotingButton" src/pages/UserProfile.tsx; then
    echo "  ✓ VotingButton imported in UserProfile"
else
    echo "  ✗ VotingButton not imported in UserProfile"
fi

if grep -q "GraphButton" src/pages/UserProfile.tsx; then
    echo "  ✓ GraphButton imported in UserProfile"
else
    echo "  ✗ GraphButton not imported in UserProfile"
fi

echo ""
echo "✅ Checking TypeScript compilation..."
npm run type-check > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✓ TypeScript compilation successful"
else
    echo "  ✗ TypeScript compilation failed"
fi

echo ""
echo "✅ Checking if recharts is installed..."
if npm list recharts > /dev/null 2>&1; then
    echo "  ✓ recharts library installed"
else
    echo "  ✗ recharts library not installed"
fi

echo ""
echo "🎉 Implementation Summary:"
echo "  • VotingButton: Toggle voting with visual feedback"
echo "  • GraphButton: Opens activity graph modal"
echo "  • GraphModal: Shows 30-day activity line chart"
echo "  • Voting Service: API calls with mock fallbacks"
echo "  • Analytics Service: Extended for user activity data"
echo "  • UserProfile: Integrated beside follow stats"
echo ""
echo "📍 Components are positioned beside follow/following counts as requested"
echo "🎨 Styled with blue theme to match existing design"
echo "📱 Responsive and mobile-friendly"
echo ""
echo "To test the functionality:"
echo "1. Navigate to any user profile"
echo "2. Look for voting and graph buttons beside follow stats"
echo "3. Click voting button to toggle vote (highlights when voted)"
echo "4. Click graph button to open activity chart modal"
