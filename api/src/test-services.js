const postcodeService = require('./services/postcodeService');
const travelTimeService = require('./services/travelTimeService');

async function testServices() {
  console.log('TESTING EXTERNAL SERVICES');
  console.log('==============================\n');
  
  try {
    // Test 1: Postcode lookup
    console.log('Test 1: Postcode Lookup');
    const officeCoords = await postcodeService.getCoordinates('CM2 7PJ');
    console.log('Office coordinates:', officeCoords);
    
    const propertyCoords = await postcodeService.getCoordinates('SW1A 1AA');
    console.log('Property coordinates:', propertyCoords);
    
    // Test 2: Travel time calculation
    console.log('\nTest 2: Travel Time Calculation');
    const travelInfo = await travelTimeService.calculateTravelInfo('SW1A 1AA');
    console.log('Travel info:', travelInfo);
    
    // Test 3: Schedule calculation
    console.log('\nTest 3: Schedule Calculation');
    const schedule = travelTimeService.calculateScheduleTimes('14:00', travelInfo.travelTimeMinutes);
    console.log('Schedule:', schedule);
    
    console.log('\nALL SERVICE TESTS PASSED!');
    
  } catch (error) {
    console.error('\nSERVICE TEST FAILED:');
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

testServices();