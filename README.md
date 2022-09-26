## Server

#### Endpoints

| PATH                      | METHOD | RESPONSE            | ACTION                                |
| ------------------------- | ------ | ------------------- | ------------------------------------- |
| api/auth/signup           | POST   | 200                 | Creates a new user on the database    |
| api/auth/login            | POST   | 200 + {token}       | Check if user exits on the database   |
| api/auth/me               | POST   | 200 + {user}        | Recieves a token then returns an user |
| api/user/logout           | GET    | 200                 | User logout                           |
| api/user/delete/:id       | DELETE | 200                 | User gets deleted                     |
| api/user/profile/:id      | GET    | 200 + {user}        | Get user info                         |
| api/user/profile/edit/:id | PUT    | 200                 | User edit its own profile             |
| api/trip/all              | GET    | 200 +Array of trips | User(driver) sees all available trips |
| api/trip/new              | POST   | 200                 | User(client) creates a new trip       |
| api/trip/:id/driver       | GET    | 200 + trip details  | Trip has a new driver                 |
| api/trip/:id/finished     | GET    | 200                 | Trip is finished                      |
