const { db } = require('../../config/database');

class AuditRepositoryImpl {
  async create(auditEntry) {
    await db('audit_logs').insert({
      id: auditEntry.id,
      user_id: auditEntry.userId,
      entity_type: auditEntry.entityType,
      entity_id: auditEntry.entityId,
      action: auditEntry.action,
      old_values: auditEntry.oldValues,
      new_values: auditEntry.newValues,
      ip_address: auditEntry.ipAddress,
      user_agent: auditEntry.userAgent,
      created_at: auditEntry.timestamp || new Date()
    });

    return auditEntry;
  }

  async findByFilters(filters, options = {}) {
    let query = db('audit_logs as al')
      .leftJoin('users as u', 'al.user_id', 'u.id')
      .select(
        'al.*',
        'u.full_name as user_name',
        'u.email as user_email'
      );

    // Apply filters
    if (filters.userId) {
      query = query.where('al.user_id', filters.userId);
    }

    if (filters.entityType) {
      query = query.where('al.entity_type', filters.entityType);
    }

    if (filters.entityId) {
      query = query.where('al.entity_id', filters.entityId);
    }

    if (filters.actions && filters.actions.length > 0) {
      query = query.whereIn('al.action', filters.actions);
    }

    if (filters.startDate) {
      query = query.where('al.created_at', '>=', filters.startDate);
    }

    if (filters.endDate) {
      query = query.where('al.created_at', '<=', filters.endDate);
    }

    // Apply options
    if (options.limit) {
      query = query.limit(options.limit);
    }

    query = query.orderBy('al.created_at', 'desc');

    const results = await query;
    
    return results.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      timestamp: row.created_at
    }));
  }

  async getStatistics(dateRange = {}) {
    let query = db('audit_logs');

    if (dateRange.startDate) {
      query = query.where('created_at', '>=', dateRange.startDate);
    }

    if (dateRange.endDate) {
      query = query.where('created_at', '<=', dateRange.endDate);
    }

    const [stats] = await query
      .select(
        db.raw('COUNT(*) as total_entries'),
        db.raw('COUNT(DISTINCT user_id) as unique_users'),
        db.raw('COUNT(DISTINCT entity_type) as entity_types')
      );

    const actionStats = await query.clone()
      .select('action')
      .count('* as count')
      .groupBy('action')
      .orderBy('count', 'desc');

    const entityStats = await query.clone()
      .select('entity_type')
      .count('* as count')
      .groupBy('entity_type')
      .orderBy('count', 'desc');

    return {
      ...stats,
      topActions: actionStats,
      topEntityTypes: entityStats
    };
  }
}

module.exports = AuditRepositoryImpl;
