const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

require('dotenv').config()

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations')

async function run() {
  const dryRun = process.argv.includes('--dry-run')

  const files = fs.existsSync(MIGRATIONS_DIR)
    ? fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
    : []

  if (dryRun) {
    console.log('Dry run: listing SQL for migrations (no DB connection)')
    if (files.length === 0) {
      console.log('No migration files found in', MIGRATIONS_DIR)
      process.exit(0)
    }
    for (const file of files) {
      console.log('\n--- ' + file + ' ---\n')
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      console.log(sql)
    }
    console.log('\nDry run complete')
    process.exit(0)
  }

  const summary = process.argv.includes('--summary') || process.argv.includes('-s')
  if (summary) {
    console.log('Summary: listing migration files and applied status')
    if (files.length === 0) {
      console.log('No migration files found in', MIGRATIONS_DIR)
      process.exit(0)
    }
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      for (const file of files) {
        console.log(`${file}: pending (DATABASE_URL not set — cannot check applied status)`)
      }
      process.exit(0)
    }

    const pool = new Pool({ connectionString: databaseUrl })
    try {
      for (const file of files) {
        const id = file
        const check = await pool.query('SELECT 1 FROM migrations WHERE id=$1', [id]).catch(()=>null)
        if (check && check.rowCount > 0) {
          console.log(`${file}: applied`)
        } else {
          console.log(`${file}: pending`)
        }
      }
    } catch (err) {
      console.error('Summary failed', err)
      process.exit(2)
    } finally {
      await pool.end()
    }
    process.exit(0)
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set — aborting migrations')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
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
