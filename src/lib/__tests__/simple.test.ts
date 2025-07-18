describe('Simple Test', () => {
  it('should pass basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })

  it('should pass string operations', () => {
    expect('hello' + ' ' + 'world').toBe('hello world')
  })

  it('should handle arrays', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr[0]).toBe(1)
  })

  it('should handle objects', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(42)
  })
}) 