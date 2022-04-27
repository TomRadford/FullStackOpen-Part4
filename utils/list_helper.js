const { forIn, groupBy, maxBy } = require('lodash')

const dummy = (blogs) => 1
const totalLikes = (blogs) => ((totalLikes.length === 0)
  ? 0
  : (blogs.reduce((sum, current) => sum + current.likes, 0)))

const blogFormatter = (blog) => ({
  title: blog.title,
  author: blog.author,
  likes: blog.likes,
})

const favoriteBlog = (blogs) => (blogs.length > 1
  ? blogs.reduce(
    (prev, cur) => (cur.likes > prev.likes
      ? blogFormatter(cur)
      : blogFormatter(prev)),
  )
  : blogFormatter(blogs[0]))

const groupedbyAuthor = (blogs) => groupBy(blogs, 'author')

const mostBlogs = (blogs) => {
  let blogCount = []
  forIn(groupedbyAuthor(blogs), (value, key) => {
    blogCount = blogCount.concat({
      author: key,
      blogs: value.length
    })
  })
  return maxBy(blogCount, 'blogs')
}

const mostLikes = (blogs) => {
  let likeCount = []
  forIn(groupedbyAuthor(blogs), (value, key) => {
    likeCount = likeCount.concat(
      {
        author: key,
        likes: value.reduce((totalLikes, current) => totalLikes + current.likes , 0)
      }
    )
  })
  return maxBy(likeCount, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
