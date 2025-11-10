const request = require('supertest');
const app = require('../../backend/src/app'); // Adjust the path as necessary

describe('API Endpoints', () => {
    let userId;
    let postId;

    beforeAll(async () => {
        // Create a user for testing
        const userResponse = await request(app)
            .post('/api/auth/register')
            .send({ username: 'testuser', password: 'testpassword' });
        userId = userResponse.body.id;

        // Create a post for testing
        const postResponse = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${userResponse.body.token}`)
            .send({ content: 'This is a test post' });
        postId = postResponse.body.id;
    });

    afterAll(async () => {
        // Clean up: delete the test user and post
        await request(app).delete(`/api/posts/${postId}`).set('Authorization', `Bearer ${userResponse.body.token}`);
        await request(app).delete(`/api/users/${userId}`).set('Authorization', `Bearer ${userResponse.body.token}`);
    });

    it('should fetch all posts', async () => {
        const response = await request(app).get('/api/posts');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a new post', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${userResponse.body.token}`)
            .send({ content: 'Another test post' });
        expect(response.status).toBe(201);
        expect(response.body.content).toBe('Another test post');
    });

    it('should fetch a single post', async () => {
        const response = await request(app).get(`/api/posts/${postId}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(postId);
    });

    it('should add a comment to a post', async () => {
        const commentResponse = await request(app)
            .post(`/api/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${userResponse.body.token}`)
            .send({ content: 'This is a test comment' });
        expect(commentResponse.status).toBe(201);
        expect(commentResponse.body.content).toBe('This is a test comment');
    });

    it('should like a post', async () => {
        const likeResponse = await request(app)
            .post(`/api/posts/${postId}/like`)
            .set('Authorization', `Bearer ${userResponse.body.token}`);
        expect(likeResponse.status).toBe(200);
        expect(likeResponse.body.message).toBe('Post liked');
    });
});