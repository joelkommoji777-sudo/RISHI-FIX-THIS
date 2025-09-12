const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');

// POST /api/auth/register
// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, name, grade, interests } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        error: 'Email and name are required',
        success: false
      });
    }

    // Create user ID from email (base64 encoded)
    const userId = Buffer.from(email.toLowerCase()).toString('base64');

    console.log(`📝 Registering user: ${email} (ID: ${userId})`);

    // Check if user already exists
    const existingUser = await supabaseService.getUser(userId);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        success: false
      });
    }

    // Create new user
    const userData = {
      id: userId,
      email: email.toLowerCase(),
      name,
      grade: grade || null,
      interests: interests || [],
      resume: null,
      is_active: true
    };

    const newUser = await supabaseService.createUser(userData);

    if (!newUser) {
      console.error('❌ Supabase service returned null for user creation');
      console.error('User data sent:', userData);
      return res.status(500).json({
        error: 'Failed to create user',
        success: false
      });
    }

    console.log(`✅ User registered successfully: ${newUser.id}`);

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        grade: newUser.grade,
        interests: newUser.interests
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
      success: false
    });
  }
});

// POST /api/auth/login
// Login user (for now, just verify they exist)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        success: false
      });
    }

    // Create user ID from email
    const userId = Buffer.from(email.toLowerCase()).toString('base64');

    console.log(`🔐 Logging in user: ${email} (ID: ${userId})`);

    // Get user from database
    const user = await supabaseService.getUser(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found. Please register first.',
        success: false
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account is deactivated',
        success: false
      });
    }

    // Update last login
    await supabaseService.updateUser(userId, {
      last_login: new Date().toISOString()
    });

    console.log(`✅ User logged in successfully: ${user.id}`);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        grade: user.grade,
        interests: user.interests,
        preferences: user.preferences,
        last_login: user.last_login
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
      success: false
    });
  }
});

// GET /api/auth/profile/:userId
// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`📋 Getting profile for user: ${userId}`);

    const user = await supabaseService.getUser(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        success: false
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        grade: user.grade,
        interests: user.interests,
        preferences: user.preferences,
        resume: user.resume,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login
      }
    });

  } catch (error) {
    console.error('❌ Profile retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message,
      success: false
    });
  }
});

// PUT /api/auth/profile/:userId
// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, grade, interests, preferences, resume } = req.body;

    console.log(`📝 Updating profile for user: ${userId}`);

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (grade !== undefined) updates.grade = grade;
    if (interests !== undefined) updates.interests = interests;
    if (preferences !== undefined) updates.preferences = preferences;
    if (resume !== undefined) updates.resume = resume;

    const updatedUser = await supabaseService.updateUser(userId, updates);

    if (!updatedUser) {
      return res.status(500).json({
        error: 'Failed to update profile',
        success: false
      });
    }

    console.log(`✅ Profile updated for user: ${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        grade: updatedUser.grade,
        interests: updatedUser.interests,
        preferences: updatedUser.preferences,
        resume: updatedUser.resume
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message,
      success: false
    });
  }
});

// DELETE /api/auth/profile/:userId
// Delete user account
router.delete('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🗑️ Deleting user account: ${userId}`);

    const deleted = await supabaseService.deleteUser(userId);

    if (!deleted) {
      return res.status(500).json({
        error: 'Failed to delete account',
        success: false
      });
    }

    console.log(`✅ User account deleted: ${userId}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('❌ Account deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error.message,
      success: false
    });
  }
});

// GET /api/auth/users
// Get all users (admin only - for debugging)
router.get('/users', async (req, res) => {
  try {
    console.log('📊 Getting all users');

    const users = await supabaseService.getAllUsers();

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        grade: user.grade,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login: user.last_login
      })),
      count: users.length
    });

  } catch (error) {
    console.error('❌ Users retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: error.message,
      success: false
    });
  }
});

module.exports = router;

