import express from 'express';
import { authMiddleware } from './middleware-auth.js';
import { getMySqlPool } from './mysql-db.js';

const router = express.Router();

// GET /api/cart - Get user's shopping cart
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const pool = getMySqlPool();
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT 
          sc.CartId,
          sc.UserId,
          sc.EventId,
          sc.TicketType,
          sc.Quantity,
          sc.Price,
          sc.AddedAt,
          e.Title as EventTitle,
          e.EventDate,
          e.Description as EventDescription
        FROM ShoppingCart sc
        JOIN Events e ON sc.EventId = e.EventId
        WHERE sc.UserId = ?
        ORDER BY sc.AddedAt DESC
      `;
      
      const [cartItems] = await connection.execute(query, [userId]);
      
      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
      
      res.json({
        success: true,
        cart: cartItems,
        total: parseFloat(total.toFixed(2)),
        itemCount: cartItems.length
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
});

// POST /api/cart - Add item to cart
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { eventId, ticketType = 'General', quantity = 1, price } = req.body;
  
  if (!eventId || !price || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'eventId, price, and quantity are required'
    });
  }
  
  try {
    const pool = getMySqlPool();
    const connection = await pool.getConnection();
    
    try {
      // Check if event exists
      const [eventCheck] = await connection.execute(
        'SELECT EventId FROM Events WHERE EventId = ?',
        [eventId]
      );
      
      if (eventCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      // Check if item already in cart
      const [existingItem] = await connection.execute(
        'SELECT CartId, Quantity FROM ShoppingCart WHERE UserId = ? AND EventId = ? AND TicketType = ?',
        [userId, eventId, ticketType]
      );
      
      if (existingItem.length > 0) {
        // Update quantity
        await connection.execute(
          'UPDATE ShoppingCart SET Quantity = Quantity + ?, UpdatedAt = CURRENT_TIMESTAMP WHERE CartId = ?',
          [quantity, existingItem[0].CartId]
        );
        
        res.json({
          success: true,
          message: 'Item quantity updated in cart',
          cartId: existingItem[0].CartId,
          newQuantity: existingItem[0].Quantity + quantity
        });
      } else {
        // Insert new item
        const [result] = await connection.execute(
          'INSERT INTO ShoppingCart (UserId, EventId, TicketType, Quantity, Price) VALUES (?, ?, ?, ?, ?)',
          [userId, eventId, ticketType, quantity, price]
        );
        
        res.status(201).json({
          success: true,
          message: 'Item added to cart',
          cartId: result.insertId
        });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
});

// PUT /api/cart/:cartId - Update cart item quantity
router.put('/:cartId', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const cartId = req.params.cartId;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be greater than 0'
    });
  }
  
  try {
    const pool = getMySqlPool();
    const connection = await pool.getConnection();
    
    try {
      // Verify cart item belongs to user
      const [cartItem] = await connection.execute(
        'SELECT CartId FROM ShoppingCart WHERE CartId = ? AND UserId = ?',
        [cartId, userId]
      );
      
      if (cartItem.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }
      
      // Update quantity
      await connection.execute(
        'UPDATE ShoppingCart SET Quantity = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE CartId = ?',
        [quantity, cartId]
      );
      
      res.json({
        success: true,
        message: 'Cart item updated',
        cartId: cartId,
        newQuantity: quantity
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
});

// DELETE /api/cart/:cartId - Remove item from cart
router.delete('/:cartId', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const cartId = req.params.cartId;
  
  try {
    const pool = getMySqlPool();
    const connection = await pool.getConnection();
    
    try {
      // Verify cart item belongs to user
      const [cartItem] = await connection.execute(
        'SELECT CartId FROM ShoppingCart WHERE CartId = ? AND UserId = ?',
        [cartId, userId]
      );
      
      if (cartItem.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }
      
      // Delete item
      await connection.execute(
        'DELETE FROM ShoppingCart WHERE CartId = ?',
        [cartId]
      );
      
      res.json({
        success: true,
        message: 'Item removed from cart'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const pool = getMySqlPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.execute(
        'DELETE FROM ShoppingCart WHERE UserId = ?',
        [userId]
      );
      
      res.json({
        success: true,
        message: 'Cart cleared'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});

export default router;
