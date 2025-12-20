import Post from '../models/Post.model.js';
import User from '../models/User.model.js'; 




export const createPost = async (req, res) => {
  try {
    const { title, summary, content, tags } = req.body;

    const post = await Post.create({
      author: req.user.id, 
      title,
      summary,
      content,
      tags,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getPosts = async (req, res) => {
  try {
    
    
    const posts = await Post.find({})
      .populate('author', 'name avatarId _id')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'name avatarId'
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    
    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== req.user.id.toString()
      );
    } else {
      
      post.likes.push(req.user.id);
    }
    
    await post.save();
    await post.populate('author', 'name avatarId _id');
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




export const updatePost = async (req, res) => {
  try {
    const { title, summary, content, tags } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    
    post.title = title || post.title;
    post.summary = summary || post.summary;
    post.content = content || post.content;
    post.tags = tags || post.tags;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.deleteOne(); 
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name avatarId _id')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name avatarId _id')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};