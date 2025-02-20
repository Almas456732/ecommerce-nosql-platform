const Log = require('../models/Log');

const LOG_TYPES = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  VIEW_PRODUCT: 'VIEW_PRODUCT',
  ADD_TO_CART: 'ADD_TO_CART',
  PURCHASE: 'PURCHASE',
  SEARCH: 'SEARCH',
  FILTER: 'FILTER'
};

const logActivity = async (userId, action, details) => {
  try {
    const log = new Log({
      userId,
      action,
      details,
      timestamp: new Date()
    });
    await log.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity, LOG_TYPES }; 