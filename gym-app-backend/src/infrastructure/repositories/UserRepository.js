const IUserRepository = require('../../domain/repositories/IUserRepository');
const User = require('../../domain/entities/User');
const dbConnection = require('../database/connection');

class UserRepository extends IUserRepository {
  constructor() {
    super();
    this.db = dbConnection;
  }

  async create(user) {
    const query = `
      INSERT INTO users (email, password, first_name, last_name, phone_number, date_of_birth, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, password, first_name, last_name, phone_number, date_of_birth, created_at, updated_at
    `;
    
    const values = [
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.phoneNumber,
      user.dateOfBirth,
      user.createdAt,
      user.updatedAt
    ];

    const result = await this.db.query(query, values);
    const row = result.rows[0];
    
    return new User(
      row.id,
      row.email,
      row.password,
      row.first_name,
      row.last_name,
      row.phone_number,
      row.date_of_birth,
      row.created_at,
      row.updated_at
    );
  }

  async findById(id) {
    const query = `
      SELECT id, email, password, first_name, last_name, phone_number, date_of_birth, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return new User(
      row.id,
      row.email,
      row.password,
      row.first_name,
      row.last_name,
      row.phone_number,
      row.date_of_birth,
      row.created_at,
      row.updated_at
    );
  }

  async findByEmail(email) {
    const query = `
      SELECT id, email, password, first_name, last_name, phone_number, date_of_birth, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await this.db.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return new User(
      row.id,
      row.email,
      row.password,
      row.first_name,
      row.last_name,
      row.phone_number,
      row.date_of_birth,
      row.created_at,
      row.updated_at
    );
  }

  async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount + 1}
      RETURNING id, email, password, first_name, last_name, phone_number, date_of_birth, created_at, updated_at
    `;

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return new User(
      row.id,
      row.email,
      row.password,
      row.first_name,
      row.last_name,
      row.phone_number,
      row.date_of_birth,
      row.created_at,
      row.updated_at
    );
  }

  async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT id, email, password, first_name, last_name, phone_number, date_of_birth, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await this.db.query(query, [limit, offset]);
    
    return result.rows.map(row => new User(
      row.id,
      row.email,
      row.password,
      row.first_name,
      row.last_name,
      row.phone_number,
      row.date_of_birth,
      row.created_at,
      row.updated_at
    ));
  }

  async existsByEmail(email) {
    const query = 'SELECT 1 FROM users WHERE email = $1 LIMIT 1';
    const result = await this.db.query(query, [email.toLowerCase()]);
    return result.rows.length > 0;
  }

  async getUserDetails(userId) {
    const query = `
      SELECT height, weight, injuries, goal, gender, age, created_at, updated_at
      FROM user_details
      WHERE user_id = $1
    `;
    
    const result = await this.db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  async updateUserDetails(userId, details) {
    const query = `
      INSERT INTO user_details (user_id, height, weight, injuries, goal, gender, age, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id)
      DO UPDATE SET
        height = EXCLUDED.height,
        weight = EXCLUDED.weight,
        injuries = EXCLUDED.injuries,
        goal = EXCLUDED.goal,
        gender = EXCLUDED.gender,
        age = EXCLUDED.age,
        updated_at = EXCLUDED.updated_at
      RETURNING height, weight, injuries, goal, gender, age, created_at, updated_at
    `;
    
    const values = [
      userId,
      details.height,
      details.weight,
      details.injuries,
      details.goal || null,
      details.gender || null,
      details.age != null ? parseInt(details.age, 10) : null,
      new Date(),
      new Date()
    ];
    
    const result = await this.db.query(query, values);
    return result.rows[0];
  }
}

module.exports = UserRepository;
