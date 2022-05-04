const { dummy } = require('../utils/list_helper')

test('dummy returns one', () => {
	const blog = []
	const result = dummy(blog)
	expect(result).toBe(1)
})
