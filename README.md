#when using github ensure you use .gitignore file at root of project and
#reference all files you dont want to be tracked in .gitignore such as (there can be more):
.env
config.js
/node_modules
\*pkl

#.env is used to house all private data that shouldnt be shared such as
#database details, passwords, secret keys and so on

this is what is needed in backed/.env:

#replace username, password, database_name with the one for your database
DATABASE_URL=postgresql://username:password@localhost/database_name

#using cryptographically secure random generator generate 32byte hash
#can use import os; print(os.urandom(32).hex()) in separate

SECRET_KEY = "insert random hash 32bytes"
ALGORITHM = "HS256"

#allowed origins for current implementation my need to allow more as project grows
ALLOWED_ORIGINS=http://localhost:8001,http://localhost:8002,http://localhost:8003,http://localhost:3000
AUTH_TOKEN_URL=http://localhost:8000/auth/token

this is frontend/.env:
REACT_APP_AUTH_API_URL=http://localhost:8000
REACT_APP_DASHBOARD_API_URL=http://localhost:8001
REACT_APP_INVENTORY_API_URL=http://localhost:8002
REACT_APP_REQUESTS_API_URL=http://localhost:8003

this is frontend/src/config.js:
export const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL;
export const DASHBOARD_API_URL = process.env.REACT_APP_DASHBOARD_API_URL;
export const INVENTORY_API_URL = process.env.REACT_APP_INVENTORY_API_URL;
export const REQUESTS_API_URL = process.env.REACT_APP_REQUESTS_API_URL;

to start ensure .env setup in backend and frontend and then:
#ideally in virtual environment
run from backend terminal:
pip install -r requirements.txt

then open separate terminals in backend for each backend backend microservice
add then run from each backend terminal:
uvicorn Authentication.main:app --reload --port 8000
uvicorn Dashboard.main:app --reload --port 8001
uvicorn Inventory.main:app --reload --port 8002
uvicorn Requests.main:app --reload --port 8003

for frontend run this is frontend terminal:
npm start
