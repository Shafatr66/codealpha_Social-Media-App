class PostsController {
    constructor(postModel) {
        this.postModel = postModel;
    }

    async createPost(req, res) {
        const { title, content } = req.body;
        try {
            const newPost = await this.postModel.create({ title, content });
            res.status(201).json(newPost);
        } catch (error) {
            res.status(500).json({ message: 'Error creating post', error });
        }
    }

    async getPosts(req, res) {
        try {
            const posts = await this.postModel.findAll();
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving posts', error });
        }
    }

    async getPostById(req, res) {
        const { id } = req.params;
        try {
            const post = await this.postModel.findById(id);
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving post', error });
        }
    }

    async updatePost(req, res) {
        const { id } = req.params;
        const { title, content } = req.body;
        try {
            const updatedPost = await this.postModel.update(id, { title, content });
            if (updatedPost) {
                res.status(200).json(updatedPost);
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating post', error });
        }
    }

    async deletePost(req, res) {
        const { id } = req.params;
        try {
            const deletedPost = await this.postModel.delete(id);
            if (deletedPost) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting post', error });
        }
    }
}

export default PostsController;