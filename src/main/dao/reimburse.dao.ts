// This DAO will access the reimbursement table to create & update reimbursements
import { SessionFactory } from '../util/session-factory';
import { Reimbursements } from '../models/reimbursements';
import { constructUpdate } from './constructUpdate';

export class ReimbursementDao {
  // Submit a new reimbursement
  public async newReimburse(reimburseData: Reimbursements) {
    const pool = SessionFactory.getConnectionPool();
    try{
      const client = await pool.connect();
      console.log('Connected to db ...');
      const result = await client.query(`INSERT INTO reimbursements(author_id, amount, date_submit, description, status_id, type_id) 
      VALUES ($1, $2, NOW(), $3, $4, $5) RETURNING *;`, [reimburseData.author_id, reimburseData.amount, reimburseData.description,
      reimburseData.status_id, reimburseData.type_id]);
      client.release();
      console.log(result.rows[0]);
      return result.rows[0] || false;
    } catch (error){
      console.log('There was an issue submitting the reimbursement.\n', error);
    }
   
  }

  // Find reimbursements by status_id
  public async findById(id: number) {
    console.log('The status_id passed in (reimburse) is: ', id);
    const pool = SessionFactory.getConnectionPool();
    try {
      const client = await pool.connect();
      console.log('Connected to db ...');
      const result = await client.query('SELECT * FROM reimbursements WHERE status_id=$1;', [id]);
      if(result) {
        console.log('From the db we got these reimbursements:');
        console.log(result.rows);
        return result.rows || false;
      }
    } catch (error) {
      console.log('There was an issue searching by the status_id in the db.');
    } 
  }

  // Find reimbursements by user_id
  public async findByUserId(id: number) {
    console.log('The user_id passed in (reimburse) is: ', id);
    const pool = SessionFactory.getConnectionPool();
    try {
      const client = await pool.connect();
      console.log('Connected to db ...');
      const result = await client.query('SELECT * FROM reimbursements WHERE author_id=$1;', [id]);
      await client.release();
      if (result) {
        console.log('From the db we got these reimbursements:');
        console.log(result.rows);
        return result.rows || false;
      }
    } catch (error) {
      console.log('There was an issue searching by the author_id in the db.');
    }
  }

  // Update reimbursement
  public async updateReimbursement(reimbData: Reimbursements) {
    console.log('The reimbursement data to update is ', reimbData);
    const pool = SessionFactory.getConnectionPool();
    try {
      const client = await pool.connect();
      console.log('Connected to db ...');
      let reimbFields = ['author_id', 'amount', 'description', 'resolver_id', 'status_id', 'type_id'];

      // Construct update query with values from request
      let queryObj = constructUpdate(reimbFields, reimbData, 'reimburse_id');
      console.log('Query to run for update:\n', queryObj);
      const result = await client.query(`UPDATE reimbursements SET ${queryObj.qString}`, queryObj.arrVals);
      await client.release();

      // Return result
      if (result) {
        console.log('Result from reimbursement update (dao): ');
        console.log(result.rows[0]);
        return result.rows[0];
      }
      
    } catch (error) {
      console.log('There was an error updating reimbursements:\n', error);
    }
  }
}