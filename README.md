```
npm i
cp .env.dist .env
complete .env with API keys
run http://localhost:3000/?user_id=1&role=admin to access on an admin account
run http://localhost:3000/?user_id=11&role=employer to access on an employer account
run http://localhost:3000/?user_id=101&role=candidate to access on an employer account

like an employer, you can go on candidate page and click on the candidate you're interested, it will join a channel between you,
the candidate and the coachs will be automatically added

If the url is wrong (like wrong user_id, wrong role, empty query...) you'll get a 404 error page
```
