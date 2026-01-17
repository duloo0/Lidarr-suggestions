import { Throttle } from '@/lib/throttle'

describe('Throttle', () => {
  it('should delay requests when exceeding rate limit', async () => {
    const throttle = new Throttle({ requestsPerSecond: 5 })
    await throttle.execute(() => Promise.resolve())

    const start = Date.now()
    await throttle.execute(() => Promise.resolve())
    const elapsed = Date.now() - start

    expect(elapsed).toBeGreaterThanOrEqual(150)
  })

  it('should return the result from executed function', async () => {
    const throttle = new Throttle({ requestsPerSecond: 10 })
    const result = await throttle.execute(() => Promise.resolve('test-value'))
    expect(result).toBe('test-value')
  })
})
