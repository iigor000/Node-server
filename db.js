// Use the MariaDB Node.js Connector
import mariadb from 'mariadb';
 
// Create a connection pool
var pool = 
  mariadb.createPool({
    host: '127.0.0.1', 
    port: 3306,
    user: 'root', 
    password: '123',
    database: 'server'
  });
 
// Expose a method to establish connection with MariaDB SkySQL
export default Object.freeze({
  pool: pool
});