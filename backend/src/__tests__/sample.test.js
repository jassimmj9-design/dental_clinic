const { describe, it, expect } = require('@jest/globals');

describe('Backend sample test', () => {
  it('should run a sample assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
