const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

require('dotenv').config()

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations')

async function run() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set — aborting migrations')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
    for (const file of files) {
      const id = file
      const check = await pool.query('SELECT 1 FROM migrations WHERE id=$1', [id]).catch(()=>null)
      if (check && check.rowCount > 0) {
        console.log(`Skipping already-applied migration ${id}`)
        continue
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      console.log('Applying', file)
      await pool.query(sql)
      await pool.query('INSERT INTO migrations(id) VALUES($1)', [id])
    }
    console.log('Migrations complete')
  } catch (err) {
    console.error('Migration failed', err)
    process.exit(2)
  } finally {
    await pool.end()
  }
}

run()
