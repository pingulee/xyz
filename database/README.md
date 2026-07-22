# Review MySQL Setup

1. In Hostinger, open the MySQL database `u370032164_xyz`.
2. Run `database/booster.sql`, `database/review.sql`, and
   `database/champions.sql` in phpMyAdmin or the Hostinger SQL console.
3. Add these environment variables to the Node.js deployment:

```env
MYSQL_HOST=srv1040.hstgr.io
MYSQL_PORT=3306
MYSQL_DATABASE=u370032164_xyz
MYSQL_USER=u370032164_xyz
MYSQL_PASSWORD=your_mysql_password
ADMIN_PASSWORD=your_admin_password
```

4. If connecting from your local computer, add your public IP address to
   Hostinger's remote MySQL access list for `u370032164_xyz`.

The review API uses `/api/review` and requires a Node.js runtime. A static-only
deployment will not be able to write review entries to MySQL.

Champion names are synced from Riot Data Dragon into MySQL when an admin logs in.
The normal `/api/champions` endpoint only reads from MySQL and does not call Riot
during user requests.
