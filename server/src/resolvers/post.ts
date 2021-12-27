import { Post } from '../entities/post'
import { Arg, Int, Mutation, Query, Resolver } from 'type-graphql'

// Resolver for Posts Entity
@Resolver()
export class PostResolver {
  @Query(() => [Post], { nullable: true })
  posts(): Promise<Post[]> {
    return Post.find()
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    return Post.create({ title }).save()
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('title', () => String, { nullable: true }) title: string,
    @Arg('id', () => Int) id: number
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } })
    if (!post) return null
    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title })
    }
    return post
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    try {
      Post.delete(id)
      return true
    } catch (err) {
      return false
    }
  }
}
