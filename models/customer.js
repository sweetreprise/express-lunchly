/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** find a customer using their name */

  static async find(name) {
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    const results = await db.query(`
      SELECT id, 
      first_name AS "firstName",
      last_name AS "lastName",
      phone, notes
      FROM customers WHERE $1 IN(first_name, last_name)
    `, [capitalizedName]);

    const customers = results.rows;

    if(customers.length === 0) {
      const err = new Error(`Sorry, your search for ${name} yielded no results.`);
      err.status = 404;
      throw err;
    }
    return customers.map(c => new Customer(c));
  }

  static async findBest() {
    console.log('hey')
    const results = await db.query(`
    SELECT COUNT(r.id), c.id, c.first_name AS "firstName", 
    c.last_name AS "lastName"
    FROM customers AS c
    LEFT JOIN
    reservations AS r
    ON c.id = r.customer_id
    GROUP BY c.last_name, c.first_name, c.id
    ORDER BY COUNT(r.id) DESC
    LIMIT 10
    `);

    const bestCustomers = results.rows;

    if(bestCustomers.length === 0) {
      const err = new Error(`Sorry, there was an error getting your results`);
      err.status = 404;
      throw err;
    }

    return bestCustomers.map(c => new Customer(c));
  }

  /** get a customer's full name */

  fullName(){
    return `${this.firstName} ${this.lastName}`;
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
