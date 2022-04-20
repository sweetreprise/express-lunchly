/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    await db.query(
      `INSERT INTO reservations 
      (customer_id, num_guests, start_at, notes)
      VALUES ($1, $2, $3, $4)
      `,
      [this.customerId, this.numGuests, this.startAt, this.notes]
    )
  }

}

module.exports = Reservation;

`SELECT COUNT(r.id), c.first_name, c.last_name 
FROM customers AS c 
LEFT JOIN 
reservations AS r 
ON c.id = r.customer_id 
GROUP BY c.last_name, c.first_name  
ORDER BY COUNT(r.id) DESC 
LIMIT 10;

`
