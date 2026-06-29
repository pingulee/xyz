# Reviews MySQL Setup

1. In Hostinger, open the MySQL database `u370032164_xyz`.
2. Run `database/reviews.sql` in phpMyAdmin or the Hostinger SQL console.
3. Add these environment variables to the Node.js deployment:

```env
MYSQL_HOST=srv1040.hstgr.io
MYSQL_PORT=3306
MYSQL_DATABASE=u370032164_xyz
MYSQL_USER=u370032164_xyz
MYSQL_PASSWORD=your_mysql_password
REVIEW_ADMIN_PASSWORD=your_admin_review_delete_password
```

4. If connecting from your local computer, add your public IP address to
   Hostinger's remote MySQL access list for `u370032164_xyz`.

The reviews API uses `/api/reviews` and requires a Node.js runtime. A static-only
deployment will not be able to write reviews to MySQL.
