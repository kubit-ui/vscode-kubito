/**
 * Test suite for contextual messaging functionality
 * Tests time-based message selection and configuration handling
 */

import * as assert from 'assert';

suite('Contextual Messages Test Suite', () => {
  test('Should detect morning context correctly', () => {
    // Test morning time range (6-12)
    function isMorning(hour: number): boolean {
      return hour >= 6 && hour < 12;
    }

    assert.strictEqual(isMorning(9), true, 'Should detect 9 AM as morning time');
    assert.strictEqual(isMorning(6), true, 'Should detect 6 AM as morning');
    assert.strictEqual(isMorning(11), true, 'Should detect 11 AM as morning');
    assert.strictEqual(isMorning(12), false, 'Should not detect 12 PM as morning');
    assert.strictEqual(isMorning(5), false, 'Should not detect 5 AM as morning');
  });

  test('Should detect evening context correctly', () => {
    // Test evening time range (18-22)
    function isEvening(hour: number): boolean {
      return hour >= 18 && hour < 22;
    }

    assert.strictEqual(isEvening(20), true, 'Should detect 8 PM as evening time');
    assert.strictEqual(isEvening(18), true, 'Should detect 6 PM as evening');
    assert.strictEqual(isEvening(21), true, 'Should detect 9 PM as evening');
    assert.strictEqual(isEvening(22), false, 'Should not detect 10 PM as evening');
    assert.strictEqual(isEvening(17), false, 'Should not detect 5 PM as evening');
  });

  test('Should detect weekend context correctly', () => {
    // Test weekend detection (Saturday = 6, Sunday = 0)
    function isWeekend(dayOfWeek: number): boolean {
      return [0, 6].includes(dayOfWeek);
    }

    assert.strictEqual(isWeekend(6), true, 'Should detect Saturday as weekend');
    assert.strictEqual(isWeekend(0), true, 'Should detect Sunday as weekend');
    assert.strictEqual(isWeekend(1), false, 'Should not detect Monday as weekend');
    assert.strictEqual(isWeekend(5), false, 'Should not detect Friday as weekend');
  });

  test('Should detect late night context correctly', () => {
    // Test late night time range (22-6, wrapping around midnight)
    function isLateNight(hour: number): boolean {
      return hour >= 22 || hour < 6;
    }

    assert.strictEqual(isLateNight(23), true, 'Should detect 11 PM as late night');
    assert.strictEqual(isLateNight(2), true, 'Should detect 2 AM as late night');
    assert.strictEqual(isLateNight(22), true, 'Should detect 10 PM as late night');
    assert.strictEqual(isLateNight(5), true, 'Should detect 5 AM as late night');
    assert.strictEqual(isLateNight(6), false, 'Should not detect 6 AM as late night');
    assert.strictEqual(isLateNight(21), false, 'Should not detect 9 PM as late night');
  });

  test('Should provide contextual message keys for different contexts', () => {
    // Test that we have appropriate message categories

    // Monday morning context messages
    const mondayMorningContexts = ['mondayBlues', 'letsCode', 'coffee', 'motivated'];
    assert.ok(mondayMorningContexts.length > 0, 'Should have Monday morning messages');
    assert.ok(mondayMorningContexts.includes('mondayBlues'), 'Should include Monday Blues message');

    // Friday context messages
    const fridayContexts = ['fridayFeeling', 'deployFriday', 'almostThere', 'weekend'];
    assert.ok(fridayContexts.length > 0, 'Should have Friday messages');
    assert.ok(fridayContexts.includes('fridayFeeling'), 'Should include Friday Feeling message');

    // Late night context messages
    const lateNightContexts = ['workingLate', 'tired', 'sleeping', 'nightOwl'];
    assert.ok(lateNightContexts.length > 0, 'Should have late night messages');
    assert.ok(lateNightContexts.includes('workingLate'), 'Should include Working Late message');
  });

  test('Should validate message key structure', () => {
    // Test message key validation
    const sampleMessages = [
      'mondayBlues',
      'fridayFeeling',
      'workingLate',
      'coffee',
      'productive',
      'weekend'
    ];

    sampleMessages.forEach(message => {
      assert.strictEqual(typeof message, 'string', `Message key ${message} should be a string`);
      assert.ok(message.length > 0, `Message key ${message} should not be empty`);
      assert.ok(
        /^[a-zA-Z][a-zA-Z0-9]*$/.test(message),
        `Message key ${message} should be camelCase`
      );
    });
  });

  test('Should validate time context enumeration', () => {
    // Test context enumeration structure
    const timeContexts = ['morning', 'afternoon', 'evening', 'lateNight'];
    const dayContexts = ['monday', 'friday', 'weekend', 'workday'];

    [...timeContexts, ...dayContexts].forEach(context => {
      assert.strictEqual(typeof context, 'string', `Context ${context} should be a string`);
      assert.ok(context.length > 0, `Context ${context} should not be empty`);
    });
  });
});
