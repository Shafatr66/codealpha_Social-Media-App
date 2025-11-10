const API = {
  register: () => '/api/auth/register',
  login: () => '/api/auth/login',
  me: () => '/api/me',
  createPost: () => '/api/posts',
  feed: () => '/api/posts/feed',
  user: (id) => `/api/users/${id}`,
  userPosts: (id) => `/api/posts/user/${id}`,
  comments: (postId) => `/api/comments/${postId}`,
  addComment: () => '/api/comments',
  toggleLike: () => '/api/likes/toggle',
  likeInfo: (postId) => `/api/likes/${postId}`,
  followToggle: () => '/api/follow/toggle',
  followStats: (userId) => `/api/follow/stats/${userId}`,
  searchUsers: (q) => `/api/users/search?q=${encodeURIComponent(q)}`
};

let state = {
  token: null,
  user: null,
  viewingProfileId: null,
};

const els = {
  auth: document.getElementById('auth'),
  app: document.getElementById('app'),
  userBar: document.getElementById('user-bar'),
  search: document.getElementById('search'),
  logoutBtn: document.getElementById('logoutBtn'),
  // Auth
  tabs: document.querySelectorAll('.tab'),
  panels: document.querySelectorAll('.panel'),
  authError: document.getElementById('authError'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  loginSubmit: document.getElementById('loginSubmit'),
  regUsername: document.getElementById('regUsername'),
  regEmail: document.getElementById('regEmail'),
  regPassword: document.getElementById('regPassword'),
  registerSubmit: document.getElementById('registerSubmit'),
  // Composer & Feed
  postContent: document.getElementById('postContent'),
  postSubmit: document.getElementById('postSubmit'),
  feed: document.getElementById('feed'),
  // Profile
  profile: document.getElementById('profile'),
  profileAvatar: document.getElementById('profileAvatar'),
  profileUsername: document.getElementById('profileUsername'),
  profileBio: document.getElementById('profileBio'),
  profileCreated: document.getElementById('profileCreated'),
  statFollowers: document.getElementById('statFollowers'),
  statFollowing: document.getElementById('statFollowing'),
  statPosts: document.getElementById('statPosts'),
  profilePosts: document.getElementById('profilePosts'),
  followToggle: document.getElementById('followToggle'),
};

function setToken(token) {
  state.token = token;
  localStorage.setItem('nova_token', token || '');
}

function getHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (state.token) h['Authorization'] = `Bearer ${state.token}`;
  return h;
}

async function api(method, url, body) {
  const res = await fetch(url, { method, headers: getHeaders(), body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function showAuth() {
  els.auth.classList.remove('hidden');
  els.app.classList.add('hidden');
  els.userBar.classList.add('hidden');
}
function showApp() {
  els.auth.classList.add('hidden');
  els.app.classList.remove('hidden');
  els.userBar.classList.remove('hidden');
}

function switchTab(target) {
  els.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
  els.panels.forEach(p => p.classList.toggle('active', p.id === target));
}

function avatarUrl(user) {
  if (user.avatar_url) return user.avatar_url;
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.username)}`;
}

function renderPost(post) {
  const div = document.createElement('div');
  div.className = 'post';
  div.innerHTML = `
    <div class="post-header">
      <img class="avatar" src="${avatarUrl({ username: post.username, avatar_url: '' })}" alt="${post.username}" />
      <div>
        <strong class="link" data-profile-id="${post.user_id}">@${post.username}</strong>
        <div class="muted">${new Date(post.created_at).toLocaleString()}</div>
      </div>
    </div>
    <div class="post-content">${escapeHtml(post.content)}</div>
    <div class="post-actions">
      <button class="likeBtn ${post.liked ? 'active' : ''}" data-post-id="${post.id}">❤ ${post.likes_count}</button>
      <button class="commentToggle" data-post-id="${post.id}">💬 ${post.comments_count}</button>
    </div>
    <div class="comment-section hidden" id="comments-${post.id}">
      <div class="comment-list" id="comment-list-${post.id}"></div>
      <div class="comment-composer">
        <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}" />
        <button class="btn" data-post-id="${post.id}" id="comment-submit-${post.id}">Reply</button>
      </div>
    </div>
  `;
  return div;
}

function escapeHtml(str) {
  return str.replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function loadFeed() {
  const { posts } = await api('GET', API.feed());
  els.feed.innerHTML = '';
  posts.forEach(p => {
    const node = renderPost(p);
    els.feed.appendChild(node);
  });
}

async function loadComments(postId) {
  const { comments } = await api('GET', API.comments(postId));
  const list = document.getElementById(`comment-list-${postId}`);
  list.innerHTML = '';
  comments.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `<strong>@${c.username}</strong> ${escapeHtml(c.content)} <span class="muted" style="float:right">${new Date(c.created_at).toLocaleString()}</span>`;
    list.appendChild(div);
  });
}

async function openProfile(userId) {
  const { user, stats } = await api('GET', API.user(userId));
  const { followers, following, iFollow } = await api('GET', API.followStats(userId));

  state.viewingProfileId = userId;
  els.profileAvatar.src = avatarUrl(user);
  els.profileUsername.textContent = `@${user.username}`;
  els.profileBio.textContent = user.bio || '';
  els.profileCreated.textContent = new Date(user.created_at).toLocaleDateString();
  els.statFollowers.textContent = followers;
  els.statFollowing.textContent = following;
  els.statPosts.textContent = stats.posts;
  els.followToggle.textContent = iFollow ? 'Unfollow' : 'Follow';

  const { posts } = await api('GET', API.userPosts(userId));
  els.profilePosts.innerHTML = '';
  posts.forEach(p => els.profilePosts.appendChild(renderPost(p)));

  els.profile.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function attachGlobalHandlers() {
  // Tabs
  els.tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

  // Logout
  els.logoutBtn.addEventListener('click', () => {
    setToken(null); state.user = null; showAuth();
  });

  // Search
  let searchDebounce;
  els.search.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    const q = els.search.value.trim();
    searchDebounce = setTimeout(async () => {
      if (!q) return;
      const { users } = await api('GET', API.searchUsers(q));
      if (users.length > 0) openProfile(users[0].id);
    }, 300);
  });

  // Composer
  els.postSubmit.addEventListener('click', async () => {
    const content = els.postContent.value.trim();
    if (!content) return;
    await api('POST', API.createPost(), { content });
    els.postContent.value = '';
    await loadFeed();
  });

  // Feed interactions
  els.feed.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.classList.contains('likeBtn')) {
      const postId = Number(target.dataset.postId);
      const { liked } = await api('POST', API.toggleLike(), { post_id: postId });
      const info = await api('GET', API.likeInfo(postId));
      target.textContent = `❤ ${info.count}`;
      target.classList.toggle('active', liked);
    }
    if (target.classList.contains('commentToggle')) {
      const postId = Number(target.dataset.postId);
      const section = document.getElementById(`comments-${postId}`);
      const isHidden = section.classList.contains('hidden');
      section.classList.toggle('hidden');
      if (isHidden) await loadComments(postId);
    }
    if (target.classList.contains('link') && target.dataset.profileId) {
      openProfile(Number(target.dataset.profileId));
    }
    if (target.id && target.id.startsWith('comment-submit-')) {
      const postId = Number(target.dataset.postId);
      const input = document.getElementById(`comment-input-${postId}`);
      const content = input.value.trim();
      if (!content) return;
      await api('POST', API.addComment(), { post_id: postId, content });
      input.value = '';
      await loadComments(postId);
    }
  });

  // Profile follow toggle
  els.followToggle.addEventListener('click', async () => {
    const uid = state.viewingProfileId;
    if (!uid) return;
    const { following } = await api('POST', API.followToggle(), { user_id: uid });
    els.followToggle.textContent = following ? 'Unfollow' : 'Follow';
    const { followers, following: f2 } = await api('GET', API.followStats(uid));
    els.statFollowers.textContent = followers; els.statFollowing.textContent = f2;
  });
}

async function bootstrap() {
  attachGlobalHandlers();
  const saved = localStorage.getItem('nova_token');
  if (saved) state.token = saved;
  if (state.token) {
    try {
      const { user } = await api('GET', API.me());
      state.user = user;
      showApp();
      await loadFeed();
    } catch (e) {
      showAuth();
    }
  } else {
    showAuth();
  }

  els.loginSubmit.addEventListener('click', async () => {
    try {
      const { token, user } = await api('POST', API.login(), { email: els.loginEmail.value.trim(), password: els.loginPassword.value.trim() });
      setToken(token); state.user = user;
      els.authError.textContent = '';
      showApp();
      await loadFeed();
    } catch (e) { els.authError.textContent = e.message; }
  });

  els.registerSubmit.addEventListener('click', async () => {
    try {
      const { token, user } = await api('POST', API.register(), { username: els.regUsername.value.trim(), email: els.regEmail.value.trim(), password: els.regPassword.value.trim() });
      setToken(token); state.user = user;
      els.authError.textContent = '';
      showApp();
      await loadFeed();
    } catch (e) { els.authError.textContent = e.message; }
  });
}

bootstrap();